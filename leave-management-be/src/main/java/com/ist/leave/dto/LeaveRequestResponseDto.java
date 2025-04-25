package com.ist.leave.dto;

import com.ist.leave.entity.LeaveStatus;
import com.ist.leave.entity.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestResponseDto {
    private Long id;
    private Long userId;
    private String userFullName;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean halfDay;
    private LeaveStatus status;
    private String reason;
    private String comment;
    private String uploadedDocumentUrl;
    private LocalDate createdAt;
    private LocalDate updatedAt;
} 