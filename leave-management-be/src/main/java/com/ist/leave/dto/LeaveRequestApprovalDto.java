package com.ist.leave.dto;

import com.ist.leave.entity.LeaveStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestApprovalDto {
    @NotNull(message = "Status is required")
    private LeaveStatus status;

    private String comment;
} 