package com.ist.leave.service;

import com.ist.leave.dto.LeaveRequestDto;
import com.ist.leave.dto.LeaveRequestResponseDto;
import com.ist.leave.dto.LeaveRequestApprovalDto;
import com.ist.leave.entity.LeaveRequest;
import com.ist.leave.entity.User;
import com.ist.leave.entity.Role;
import com.ist.leave.entity.LeaveStatus;
import com.ist.leave.event.LeaveRequestStatusChangedEvent;
import com.ist.leave.repository.LeaveRequestRepository;
import com.ist.leave.repository.UserRepository;
import com.ist.leave.specification.LeaveRequestSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public LeaveRequestResponseDto submitLeaveRequest(LeaveRequestDto requestDto, MultipartFile document) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        validateLeaveRequest(requestDto);

        String documentUrl = null;
        if (document != null && !document.isEmpty()) {
            documentUrl = fileStorageService.storeFile(document);
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .user(user)
                .leaveType(requestDto.getLeaveType())
                .startDate(requestDto.getStartDate())
                .endDate(requestDto.getEndDate())
                .halfDay(requestDto.isHalfDay())
                .reason(requestDto.getReason())
                .uploadedDocumentUrl(documentUrl)
                .build();

        leaveRequest = leaveRequestRepository.save(leaveRequest);
        return mapToResponseDto(leaveRequest);
    }

    public List<LeaveRequestResponseDto> getUserLeaveRequests() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return leaveRequestRepository.findByUser(user).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public LeaveRequestResponseDto getLeaveRequest(Long id) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (!leaveRequest.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to leave request");
        }

        return mapToResponseDto(leaveRequest);
    }

    @Transactional
    public LeaveRequestResponseDto approveLeaveRequest(Long id, LeaveRequestApprovalDto approvalDto) {
        String approverEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new RuntimeException("Approver not found"));

        if (approver.getRole() != Role.ADMIN && approver.getRole() != Role.MANAGER) {
            throw new RuntimeException("Only Admins or Managers can approve/reject leave requests");
        }

        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException("Only pending leave requests can be approved/rejected");
        }

        leaveRequest.setStatus(approvalDto.getStatus());
        leaveRequest.setComment(approvalDto.getComment());
        leaveRequest = leaveRequestRepository.save(leaveRequest);

        eventPublisher.publishEvent(new LeaveRequestStatusChangedEvent(this, leaveRequest, approvalDto.getComment()));

        return mapToResponseDto(leaveRequest);
    }

    @Transactional
    public List<LeaveRequestResponseDto> getAllLeaveRequestsFiltered(
            String department, String status, String leaveType, LocalDate startDate, LocalDate endDate) {
        Specification<LeaveRequest> spec = LeaveRequestSpecifications.filterByCriteria(
                department, status, leaveType, startDate, endDate);

        List<LeaveRequest> requests = leaveRequestRepository.findAll(spec);

        return requests.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private void validateLeaveRequest(LeaveRequestDto requestDto) {
        if (requestDto.getEndDate().isBefore(requestDto.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }

        if (requestDto.getStartDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Start date must be today or in the future");
        }
    }

    private LeaveRequestResponseDto mapToResponseDto(LeaveRequest leaveRequest) {
        return LeaveRequestResponseDto.builder()
                .id(leaveRequest.getId())
                .userId(leaveRequest.getUser().getId())
                .userFullName(leaveRequest.getUser().getFirstName() + " " + leaveRequest.getUser().getLastName())
                .leaveType(leaveRequest.getLeaveType())
                .startDate(leaveRequest.getStartDate())
                .endDate(leaveRequest.getEndDate())
                .halfDay(leaveRequest.isHalfDay())
                .status(leaveRequest.getStatus())
                .reason(leaveRequest.getReason())
                .comment(leaveRequest.getComment())
                .uploadedDocumentUrl(leaveRequest.getUploadedDocumentUrl())
                .createdAt(leaveRequest.getCreatedAt())
                .updatedAt(leaveRequest.getUpdatedAt())
                .build();
    }
} 