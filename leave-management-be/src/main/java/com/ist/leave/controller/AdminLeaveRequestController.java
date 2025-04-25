package com.ist.leave.controller;

import com.ist.leave.dto.LeaveRequestResponseDto;
import com.ist.leave.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/leave") // New base path for admin leave endpoints
@RequiredArgsConstructor
public class AdminLeaveRequestController { // New controller for admin actions

    private final LeaveRequestService leaveRequestService;

    @GetMapping("/requests")
    @PreAuthorize("hasAuthority('ADMIN')") // Corrected - checks for ADMIN authority
    public ResponseEntity<List<LeaveRequestResponseDto>> getAllLeaveRequests(
            // Add filtering parameters (optional)
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status, // Keep as String for now
            @RequestParam(required = false) String leaveType, // Keep as String for now
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
            // TODO: Add pagination parameters (page, size, sort)
    ) {
        // TODO: Implement filtering logic in service
        // Create a filter DTO or pass parameters directly to service
        return ResponseEntity.ok(leaveRequestService.getAllLeaveRequestsFiltered(department, status, leaveType, startDate, endDate));
    }

    // Other admin-specific endpoints could go here (e.g., managing policies)
} 