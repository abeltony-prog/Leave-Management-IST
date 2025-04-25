package com.ist.leave.repository;

import com.ist.leave.entity.PTOBalance;
import com.ist.leave.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PTOBalanceRepository extends JpaRepository<PTOBalance, Long> {
    Optional<PTOBalance> findByUserAndYear(User user, int year);
} 