package com.ist.leave.controller;

import com.ist.leave.dto.UserProfileDto;
import com.ist.leave.service.AuthenticationService; // Use AuthenticationService for now
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthenticationService authenticationService; // Inject service

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUser() {
        return ResponseEntity.ok(authenticationService.getCurrentUserProfile());
    }
} 