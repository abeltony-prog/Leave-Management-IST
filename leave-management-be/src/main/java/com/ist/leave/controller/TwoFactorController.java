package com.ist.leave.controller;

import com.ist.leave.dto.AuthenticationResponse;
import com.ist.leave.dto.TwoFactorAuthRequest;
import com.ist.leave.dto.TwoFactorSetupResponse;
import com.ist.leave.entity.User;
import com.ist.leave.repository.UserRepository;
import com.ist.leave.security.JwtService;
import com.ist.leave.service.TwoFactorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/2fa")
@RequiredArgsConstructor
public class TwoFactorController {

    private final TwoFactorService twoFactorService;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @GetMapping("/setup")
    public ResponseEntity<TwoFactorSetupResponse> setup2FA() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        var credentials = twoFactorService.generateCredentials();
        user.setTwoFactorSecret(credentials.getKey());
        userRepository.save(user);
        String qrUrl = twoFactorService.getQRCodeURL("LeaveFlow", user.getEmail(), credentials);
        return ResponseEntity.ok(new TwoFactorSetupResponse(qrUrl));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> verify2FA(@RequestBody TwoFactorAuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isValid = twoFactorService.verifyCode(user.getTwoFactorSecret(), request.getCode());
        if (!isValid) {
            return ResponseEntity.status(401).build();
        }
        user.setTwoFactorEnabled(true);
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(AuthenticationResponse.builder()
                .token(token)
                .twoFactorRequired(false)
                .build());
    }
} 