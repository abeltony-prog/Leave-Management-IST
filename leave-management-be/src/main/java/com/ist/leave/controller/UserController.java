package com.ist.leave.controller;

import com.ist.leave.dto.UpdateUserRoleDto;
import com.ist.leave.dto.UserProfileDto;
import com.ist.leave.service.AuthenticationService;
import com.ist.leave.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthenticationService authenticationService;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUser() {
        return ResponseEntity.ok(authenticationService.getCurrentUserProfile());
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<UserProfileDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserProfileDto> updateUserRole(
            @PathVariable Long id,
            @RequestBody UpdateUserRoleDto updateDto) {
        return ResponseEntity.ok(userService.updateUserRole(
            id,
            updateDto.getRole(),
            updateDto.getDepartment(),
            updateDto.getTeam()
        ));
    }
} 