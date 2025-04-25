package com.ist.leave.service;

import com.ist.leave.entity.PTOBalance;
import com.ist.leave.entity.User;
import com.ist.leave.repository.PTOBalanceRepository;
import com.ist.leave.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PTOService {

    private final PTOBalanceRepository ptoBalanceRepository;
    private final UserRepository userRepository;
    private static final BigDecimal MONTHLY_ACCRUAL = new BigDecimal("1.66");
    private static final BigDecimal MAX_CARRY_FORWARD = new BigDecimal("5.00");

    @Scheduled(cron = "0 0 0 1 * ?") // Run at midnight on the 1st of every month
    @Transactional
    public void accruePTODays() {
        log.info("Starting PTO accrual process");
        List<User> users = userRepository.findAll();
        LocalDate now = LocalDate.now();
        int currentYear = now.getYear();

        for (User user : users) {
            PTOBalance balance = ptoBalanceRepository.findByUserAndYear(user, currentYear)
                    .orElseGet(() -> createNewBalance(user, currentYear));

            // Check if we need to handle year-end carry forward
            if (now.getMonthValue() == 1) { // January
                handleYearEndCarryForward(balance, currentYear);
            }

            // Accrue monthly PTO
            balance.setCurrentBalance(balance.getCurrentBalance().add(MONTHLY_ACCRUAL));
            balance.setLastAccrualDate(now);
            ptoBalanceRepository.save(balance);

            log.info("Accrued {} PTO days for user {} ({} {})", 
                    MONTHLY_ACCRUAL, 
                    user.getEmail(), 
                    user.getFirstName(), 
                    user.getLastName());
        }
        log.info("Completed PTO accrual process");
    }

    private PTOBalance createNewBalance(User user, int year) {
        return PTOBalance.builder()
                .user(user)
                .currentBalance(BigDecimal.ZERO)
                .carryForwardBalance(BigDecimal.ZERO)
                .year(year)
                .lastAccrualDate(LocalDate.now())
                .build();
    }

    private void handleYearEndCarryForward(PTOBalance balance, int currentYear) {
        BigDecimal previousYearBalance = ptoBalanceRepository.findByUserAndYear(balance.getUser(), currentYear - 1)
                .map(PTOBalance::getCurrentBalance)
                .orElse(BigDecimal.ZERO);

        BigDecimal carryForwardAmount = previousYearBalance.min(MAX_CARRY_FORWARD);
        balance.setCarryForwardBalance(carryForwardAmount);
        balance.setCurrentBalance(carryForwardAmount);
    }

    public BigDecimal getCurrentBalance(User user) {
        int currentYear = LocalDate.now().getYear();
        return ptoBalanceRepository.findByUserAndYear(user, currentYear)
                .map(balance -> balance.getCurrentBalance().add(balance.getCarryForwardBalance()))
                .orElse(BigDecimal.ZERO);
    }
} 