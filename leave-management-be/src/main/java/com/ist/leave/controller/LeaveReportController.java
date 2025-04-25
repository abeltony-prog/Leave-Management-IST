package com.ist.leave.controller;

import com.ist.leave.entity.LeaveType;
import com.ist.leave.service.LeaveReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class LeaveReportController {

    private final LeaveReportService leaveReportService;

    @GetMapping("/leave")
    public ResponseEntity<byte[]> downloadLeaveReport(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) LeaveType leaveType) {

        byte[] reportData = leaveReportService.generateLeaveReport(department, startDate, endDate, leaveType);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "leave_report.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
    }
} 