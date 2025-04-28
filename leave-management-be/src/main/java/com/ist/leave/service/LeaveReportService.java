package com.ist.leave.service;

import com.ist.leave.entity.LeaveRequest;
import com.ist.leave.entity.LeaveType;
import com.ist.leave.entity.User;
import com.ist.leave.repository.LeaveRequestRepository;
import com.ist.leave.repository.UserRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaveReportService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public byte[] generateLeaveReport(String department, LocalDate startDate, LocalDate endDate, LeaveType leaveType) {

        Specification<LeaveRequest> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            Join<LeaveRequest, User> userJoin = root.join("user");

            if (department != null && !department.isEmpty()) {
                predicates.add(cb.equal(userJoin.get("department"), department));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("endDate"), endDate));
            }
            if (leaveType != null) {
                predicates.add(cb.equal(root.get("leaveType"), leaveType));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<LeaveRequest> leaveRequests = leaveRequestRepository.findAll(spec);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
             OutputStreamWriter writer = new OutputStreamWriter(outputStream)) {

            // Write CSV header
            writer.write("Employee ID,Employee Name,Department,Leave Type,Start Date,End Date,Duration (days),Status\n");

            // Write data rows
            for (LeaveRequest request : leaveRequests) {
                User user = request.getUser();
                writer.write(String.format("%s,%s %s,%s,%s,%s,%s,%.2f,%s\n",
                    user.getId(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getDepartment(),
                    request.getLeaveType(),
                    request.getStartDate().format(DateTimeFormatter.ISO_LOCAL_DATE),
                    request.getEndDate().format(DateTimeFormatter.ISO_LOCAL_DATE),
                    request.getDuration(),
                    request.getStatus()
                ));
            }

            writer.flush();
            return outputStream.toByteArray();

        } catch (IOException e) {
            log.error("Error generating leave report", e);
            throw new RuntimeException("Failed to generate leave report", e);
        }
    }
} 