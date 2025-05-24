package com.freemarket.freemarket.global.auth.domain.password.repository;

import com.freemarket.freemarket.global.auth.domain.password.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long>, PasswordResetTokenRepositoryCustom {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByEmail(String email);
}
