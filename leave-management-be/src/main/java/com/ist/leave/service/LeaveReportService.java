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
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

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

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Leave Report");
            sheet.setDefaultColumnWidth(20);

            // Create header row
            String[] headers = {"Employee ID", "Employee Name", "Department", "Leave Type", "Start Date", "End Date", "Duration (days)", "Status"};
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Create data rows
            int rowNum = 1;
            for (LeaveRequest request : leaveRequests) {
                User user = request.getUser();
                Row row = sheet.createRow(rowNum++);

                row.createCell(0).setCellValue(user.getId());
                row.createCell(1).setCellValue(user.getFirstName() + " " + user.getLastName());
                row.createCell(2).setCellValue(user.getDepartment());
                row.createCell(3).setCellValue(request.getLeaveType().toString());
                row.createCell(4).setCellValue(request.getStartDate().format(DateTimeFormatter.ISO_LOCAL_DATE));
                row.createCell(5).setCellValue(request.getEndDate().format(DateTimeFormatter.ISO_LOCAL_DATE));
                row.createCell(6).setCellValue(request.getDuration()); // Assuming getDuration returns a double
                row.createCell(7).setCellValue(request.getStatus().toString());
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (IOException e) {
            log.error("Error generating leave report", e);
            throw new RuntimeException("Failed to generate leave report", e);
        }
    }
} 