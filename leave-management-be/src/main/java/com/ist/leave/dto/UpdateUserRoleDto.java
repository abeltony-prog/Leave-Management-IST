package com.ist.leave.dto;

import com.ist.leave.entity.Role;
import lombok.Data;

@Data
public class UpdateUserRoleDto {
    private Role role;
    private String department;
    private String team;
} 