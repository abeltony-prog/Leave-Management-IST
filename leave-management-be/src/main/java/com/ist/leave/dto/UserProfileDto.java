package com.ist.leave.dto;

import com.ist.leave.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private String msProfilePictureUrl;
    private String department;
    private String team;
    // Add other fields like leave allowance if needed later
    
    // Added fields for leave balance
    private double totalLeaveAllowance; // Using double for potential partial days
    private double usedLeaveDays;
    // availableLeaveDays can be calculated: total - used
} 