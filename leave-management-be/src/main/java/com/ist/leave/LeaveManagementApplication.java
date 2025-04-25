package com.ist.leave;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LeaveManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(LeaveManagementApplication.class, args);
    }
} 