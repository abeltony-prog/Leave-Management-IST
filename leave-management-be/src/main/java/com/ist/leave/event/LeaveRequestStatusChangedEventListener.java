package com.ist.leave.event;

import com.ist.leave.entity.LeaveRequest;
import com.ist.leave.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class LeaveRequestStatusChangedEventListener {

    private final JavaMailSender mailSender;

    @EventListener
    public void handleLeaveRequestStatusChanged(LeaveRequestStatusChangedEvent event) {
        LeaveRequest leaveRequest = event.getLeaveRequest();
        User user = leaveRequest.getUser();
        String comment = event.getComment();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Leave Request Status Update");
        message.setText(String.format(
            "Dear %s %s,\n\n" +
            "Your leave request from %s to %s has been %s.\n" +
            "Comment: %s\n\n" +
            "Best regards,\n" +
            "Leave Management System",
            user.getFirstName(),
            user.getLastName(),
            leaveRequest.getStartDate(),
            leaveRequest.getEndDate(),
            leaveRequest.getStatus().name().toLowerCase(),
            comment
        ));

        try {
            mailSender.send(message);
            log.info("Email notification sent successfully to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send email notification to {}", user.getEmail(), e);
        }
    }
} 