package com.ist.leave.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pto_balances")
public class PTOBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "current_balance", nullable = false, precision = 5, scale = 2)
    private BigDecimal currentBalance;

    @Column(name = "carry_forward_balance", nullable = false, precision = 5, scale = 2)
    private BigDecimal carryForwardBalance;

    @Column(name = "last_accrual_date", nullable = false)
    private LocalDate lastAccrualDate;

    @Column(name = "year", nullable = false)
    private int year;

    @PrePersist
    protected void onCreate() {
        if (lastAccrualDate == null) {
            lastAccrualDate = LocalDate.now();
        }
        if (year == 0) {
            year = LocalDate.now().getYear();
        }
        if (currentBalance == null) {
            currentBalance = BigDecimal.ZERO;
        }
        if (carryForwardBalance == null) {
            carryForwardBalance = BigDecimal.ZERO;
        }
    }
} 