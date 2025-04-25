package com.ist.leave.event;

import com.ist.leave.entity.LeaveRequest;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class LeaveRequestStatusChangedEvent extends ApplicationEvent {
    private final LeaveRequest leaveRequest;
    private final String comment;

    public LeaveRequestStatusChangedEvent(Object source, LeaveRequest leaveRequest, String comment) {
        super(source);
        this.leaveRequest = leaveRequest;
        this.comment = comment;
    }
} 