package com.ist.leave.controller;

import com.ist.leave.dto.LeaveRequestDto;
import com.ist.leave.dto.LeaveRequestResponseDto;
import com.ist.leave.dto.LeaveRequestApprovalDto;
import com.ist.leave.service.LeaveRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leave")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    @PostMapping("/requests")
    public ResponseEntity<LeaveRequestResponseDto> submitLeaveRequest(
            @Valid @RequestPart("request") LeaveRequestDto requestDto,
            @RequestPart(value = "document", required = false) MultipartFile document) {
        return ResponseEntity.ok(leaveRequestService.submitLeaveRequest(requestDto, document));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<LeaveRequestResponseDto>> getUserLeaveRequests() {
        return ResponseEntity.ok(leaveRequestService.getUserLeaveRequests());
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<LeaveRequestResponseDto> getLeaveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequest(id));
    }

    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<LeaveRequestResponseDto> approveLeaveRequest(
            @PathVariable Long id,
            @Valid @RequestBody LeaveRequestApprovalDto approvalDto) {
        return ResponseEntity.ok(leaveRequestService.approveLeaveRequest(id, approvalDto));
    }
} 