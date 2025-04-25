package com.ist.leave.repository;

import com.ist.leave.entity.LeaveRequest;
import com.ist.leave.entity.LeaveStatus;
import com.ist.leave.entity.LeaveType;
import com.ist.leave.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long>, JpaSpecificationExecutor<LeaveRequest> {
    List<LeaveRequest> findByUser(User user);
    List<LeaveRequest> findByUserAndStatus(User user, LeaveStatus status);
} 