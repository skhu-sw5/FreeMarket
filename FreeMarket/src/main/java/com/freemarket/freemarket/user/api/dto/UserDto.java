package com.freemarket.freemarket.user.api.dto;

import com.freemarket.freemarket.user.domain.User;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.time.LocalDateTime;

public class UserDto {

    @Schema(description = "프로필 업데이트 요청")
    public record ProfileUpdateRequest(
            @Schema(description = "사용자 이름", example = "홍길동")
            @NotBlank(message = "이름은 필수 입력값입니다.")
            String name,

            @Schema(description = "휴대폰 번호", example = "010-1234-5678")
            @Pattern(regexp = "^01(?:0|1|[6-9])[.-]?(\\d{3}|\\d{4})[.-]?(\\d{4})$", message = "휴대폰 번호 형식이 올바르지 않습니다.")
            String phone
    ) {
    }

    @Schema(description = "비밀번호 변경 요청")
    public record PasswordChangeRequest(
            @Schema(description = "현재 비밀번호", example = "currentPass123")
            @NotBlank(message = "현재 비밀번호는 필수 입력값입니다.")
            String currentPassword,

            @Schema(description = "새 비밀번호", example = "newPass456")
            @NotBlank(message = "새 비밀번호는 필수 입력값입니다.")
            @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다.")
            String newPassword
    ) {
    }

    @Builder
    @Schema(description = "사용자 응답 정보")
    public record UserResponse(
            @Schema(description = "사용자 ID", example = "1")
            Long id,

            @Schema(description = "이메일", example = "user@example.com")
            String email,

            @Schema(description = "이름", example = "홍길동")
            String name,

            @Schema(description = "휴대폰 번호", example = "010-1234-5678")
            String phone,

            @Schema(description = "사용자 역할", example = "일반 사용자")
            String role,

            @Schema(description = "이메일 인증 여부", example = "true")
            boolean emailVerified,

            @Schema(description = "총 판매 중인 상품 수", example = "3")
            int totalSellingCount,

            @Schema(description = "총 판매 완료 수", example = "7")
            int totalSoldCount,

            @Schema(description = "총 구매 수", example = "15")
            int totalPurchaseCount,

            @Schema(description = "가입 날짜", example = "2025-01-01T09:00:00")
            LocalDateTime joinDate
    ) {
        public static UserResponse from(User user, int sellingCount, int soldCount,
                                        int purchaseCount) {
            return UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .phone(user.getPhone())
                    .role(user.getRole().getDisplayName())
                    .emailVerified(user.isEmailVerified())
                    .totalSellingCount(sellingCount)
                    .totalSoldCount(soldCount)
                    .totalPurchaseCount(purchaseCount)
                    .joinDate(user.getCreatedDate())
                    .build();
        }
    }

    @Builder
    @Schema(description = "다른 사용자 응답 정보")
    public record DiffUserResponse(
            @Schema(description = "이름", example = "홍길동")
            String name,

            @Schema(description = "총 판매 중인 상품 수", example = "3")
            int totalSellingCount,

            @Schema(description = "총 판매 완료 수", example = "7")
            int totalSoldCount,

            @Schema(description = "총 구매 수", example = "15")
            int totalPurchaseCount,

            @Schema(description = "가입 날짜", example = "2025-01-01T09:00:00")
            LocalDateTime joinDate
    ) {
        public static DiffUserResponse from(User user, int sellingCount, int soldCount,
                                        int purchaseCount) {
            return DiffUserResponse.builder()
                    .name(user.getName())
                    .totalSellingCount(sellingCount)
                    .totalSoldCount(soldCount)
                    .totalPurchaseCount(purchaseCount)
                    .joinDate(user.getCreatedDate())
                    .build();
        }
    }
}
