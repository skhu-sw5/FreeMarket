package com.freemarket.freemarket.global.auth.application;

import com.freemarket.freemarket.global.auth.api.dto.PasswordDto;
import com.freemarket.freemarket.global.auth.domain.password.PasswordResetToken;
import com.freemarket.freemarket.global.auth.domain.password.repository.PasswordResetTokenRepository;
import com.freemarket.freemarket.global.email.EmailService;
import com.freemarket.freemarket.global.auth.exception.AuthException;
import com.freemarket.freemarket.user.exception.UserException;
import com.freemarket.freemarket.user.domain.User;
import com.freemarket.freemarket.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void requestPasswordReset(PasswordDto.PasswordResetRequest request) {
        String email = request.email();
        log.info("비밀번호 재설정 요청 처리: {}", email);

        // 사용자 존재 여부 확인
        Optional<User> userOptional = userRepository.findByEmail(email);

        // 사용자가 존재하지 않거나 소셜 로그인 전용 사용자인 경우 처리
        if (userOptional.isEmpty()) {
            log.info("존재하지 않는 이메일로 비밀번호 재설정 요청: {}", email);
            // 보안을 위해 예외를 던지지 않고 조용히 처리 (클라이언트에는 동일한 성공 응답 제공)
            return;
        }

        User user = userOptional.get();

        // 소셜 로그인 전용 사용자인지 확 (provider가 있고 직접 설정한 비밀번호가 없는 경우)
        if (user.getProvider() != null && !user.getProvider().isEmpty() &&
                (user.getPassword() == null || user.getPassword().isEmpty() ||
                        user.getPassword().startsWith("SOCIAL_"))) {
            log.info("소셜 로그인 전용 계정으로 비밀번호 재설정 요청: {}", email);
            // 보안을 위해 예외를 던지지 않고 조용히 처리 (클라이언트에는 동일한 성공 응답 제공)
            return;
        }

        try {
            // 기존 토큰이 있으면 삭제
            passwordResetTokenRepository.findByEmail(email)
                    .ifPresent(passwordResetTokenRepository::delete);

            // 새 토큰 생성
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .email(email)
                    .build();

            passwordResetTokenRepository.save(resetToken);

            // 이메일 발송
            emailService.sendPasswordResetEmail(email, resetToken.getToken());

            log.info("비밀번호 재설정 요청 처리 완료: {}", email);
        } catch (Exception e) {
            log.error("비밀번호 재설정 처리 중 오류 발생: {}", email, e);
            // 이메일 발송 실패 등의 오류가 발생해도 클라이언트에는 오류를 노출하지 않음
        }
    }

    @Transactional
    public void resetPassword(PasswordDto.PasswordResetVerifyRequest request) {
        String token = request.token();
        String newPassword = request.newPassword();

        log.info("비밀번호 재설정 검증 및 변경 처리 시작. 토큰: {}", token);

        // 토큰 검증
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> {
                    log.warn("유효하지 않은 비밀번호 재설정 토큰: {}", token);
                    return new AuthException.PasswordResetTokenNotFoundException();
                });

        // 만료 여부 확인
        if (resetToken.isExpired()) {
            log.warn("만료된 비밀번호 재설정 토큰: {}, 만료시간: {}", token, resetToken.getExpiryDate());
            throw new AuthException.PasswordResetTokenExpiredException();
        }

        // 사용자 정보 조회
        User user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> {
                    log.warn("토큰에 해당하는 사용자를 찾을 수 없음: {}, 이메일: {}",
                            token, resetToken.getEmail());
                    return new UserException.UserNotFoundException(resetToken.getEmail());
                });

        // 소셜 로그인 사용자인 경우 추가 처리
        if (user.getProvider() != null && !user.getProvider().isEmpty()) {
            log.info("소셜 로그인 사용자의 비밀번호 변경: {}", resetToken.getEmail());
        }

        // 비밀번호 변경
        user.changePassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 사용한 토큰 삭제
        passwordResetTokenRepository.delete(resetToken);

        log.info("비밀번호 재설정 완료: {}", resetToken.getEmail());
    }

    @Scheduled(cron = "0 */30 * * * *") // 30분마다 실행
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("만료된 비밀번호 재설정 토큰 정리 시작");
        passwordResetTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("만료된 비밀번호 재설정 토큰 정리 완료");
    }
}
