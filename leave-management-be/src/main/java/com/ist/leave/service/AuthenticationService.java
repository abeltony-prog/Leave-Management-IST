package com.ist.leave.service;

import com.ist.leave.dto.AuthenticationRequest;
import com.ist.leave.dto.AuthenticationResponse;
import com.ist.leave.dto.RegisterRequest;
import com.ist.leave.dto.UserProfileDto;
import com.ist.leave.entity.LeaveRequest;
import com.ist.leave.entity.LeaveStatus;
import com.ist.leave.entity.Role;
import com.ist.leave.entity.User;
import com.ist.leave.repository.LeaveRequestRepository;
import com.ist.leave.repository.UserRepository;
import com.ist.leave.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final LeaveRequestRepository leaveRequestRepository;

    public AuthenticationResponse register(RegisterRequest request) {
        // Check if this is the first user being registered
        boolean isFirstUser = userRepository.count() == 0;
        
        // If this is the first user, make them an ADMIN
        // Otherwise, use the role from the request or default to STAFF
        Role role = isFirstUser ? Role.ADMIN : (request.getRole() != null ? request.getRole() : Role.STAFF);
        
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .msProfilePictureUrl(request.getMsProfilePictureUrl())
                .department(request.getDepartment())
                .team(request.getTeam())
                .build();
        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public UserProfileDto getCurrentUserProfile() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        double totalAllowance = 20.0;

        List<LeaveRequest> approvedRequests = leaveRequestRepository
                .findByUserAndStatus(user, LeaveStatus.APPROVED);
        
        double usedDays = approvedRequests.stream()
                .mapToDouble(request -> {
                    long duration = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
                    return request.isHalfDay() ? 0.5 : (double) duration;
                })
                .sum();

        return UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .msProfilePictureUrl(user.getMsProfilePictureUrl())
                .department(user.getDepartment())
                .team(user.getTeam())
                .totalLeaveAllowance(totalAllowance)
                .usedLeaveDays(usedDays)
                .build();
    }
} 