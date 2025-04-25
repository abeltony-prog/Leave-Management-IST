package com.ist.leave.specification;

import com.ist.leave.entity.LeaveRequest;
import com.ist.leave.entity.LeaveStatus;
import com.ist.leave.entity.LeaveType;
import com.ist.leave.entity.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class LeaveRequestSpecifications {

    public static Specification<LeaveRequest> filterByCriteria(
            String department, String statusStr, String leaveTypeStr, LocalDate startDate, LocalDate endDate) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by Department (requires joining with User)
            if (StringUtils.hasText(department)) {
                Join<LeaveRequest, User> userJoin = root.join("user");
                predicates.add(criteriaBuilder.equal(userJoin.get("department"), department));
            }

            // Filter by Status
            if (StringUtils.hasText(statusStr)) {
                try {
                    LeaveStatus status = LeaveStatus.valueOf(statusStr.toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("status"), status));
                } catch (IllegalArgumentException e) {
                    // Handle invalid status string if necessary, maybe ignore or throw?
                    System.err.println("Invalid status filter value: " + statusStr);
                }
            }

            // Filter by Leave Type
            if (StringUtils.hasText(leaveTypeStr)) {
                 try {
                    LeaveType leaveType = LeaveType.valueOf(leaveTypeStr.toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("leaveType"), leaveType));
                } catch (IllegalArgumentException e) {
                    System.err.println("Invalid leaveType filter value: " + leaveTypeStr);
                }
            }

            // Filter by Start Date (requests starting on or after this date)
            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("startDate"), startDate));
            }

            // Filter by End Date (requests ending on or before this date)
            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("endDate"), endDate));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
} 