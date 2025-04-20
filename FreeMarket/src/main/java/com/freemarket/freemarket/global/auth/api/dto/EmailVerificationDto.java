package com.freemarket.freemarket.global.auth.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class EmailVerificationDto {

    // 이메일 인증 요청
    public record EmailVerificationRequest(
           @NotBlank(message = "이메일은 필수 입력값입니다.")
           @Email(message = "이메일 형식이 올바르지 않습니다.")
           String email
    ) {}

    // 이메일 인증 코드 확인 요청
    public record VerificationCodeRequest(
            @NotBlank(message = "이메일은 필수 입력값입니다.")
            @Email(message = "이메일 형식이 올바르지 않습니다.")
            String email,

            @NotBlank(message = "인증 코드는 필수 입력값입니다.")
            String verificationCode
    ) {}

    // 이메일 인증 응답
    public record EmailVerificationResponse(
            boolean success,
            String message
    ) {}
}
