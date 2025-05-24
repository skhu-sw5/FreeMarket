package com.freemarket.freemarket.global.auth.domain.email.repository;

import com.freemarket.freemarket.global.auth.domain.email.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findByEmail(String email);
}
