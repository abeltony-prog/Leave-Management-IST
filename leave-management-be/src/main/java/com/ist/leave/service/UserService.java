package com.ist.leave.service;

import com.ist.leave.dto.UserProfileDto;
import com.ist.leave.entity.Role;
import com.ist.leave.entity.User;
import com.ist.leave.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserProfileDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserProfileDto updateUserRole(Long id, Role role, String department, String team) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        user.setDepartment(department);
        user.setTeam(team);
        User updated = userRepository.save(user);
        return mapToDto(updated);
    }

    private UserProfileDto mapToDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .msProfilePictureUrl(user.getMsProfilePictureUrl())
                .department(user.getDepartment())
                .team(user.getTeam())
                .totalLeaveAllowance(0)
                .usedLeaveDays(0)
                .build();
    }
} 