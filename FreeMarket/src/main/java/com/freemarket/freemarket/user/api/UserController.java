package com.freemarket.freemarket.user.api;

import com.freemarket.freemarket.global.common.ResponseDTO;
import com.freemarket.freemarket.global.security.CustomUserDetails;
import com.freemarket.freemarket.product.api.dto.ProductDto;
import com.freemarket.freemarket.product.application.ProductQueryService;
import com.freemarket.freemarket.product.domain.ProductStatus;
import com.freemarket.freemarket.user.api.dto.UserDto;
import com.freemarket.freemarket.user.application.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "사용자", description = "사용자 정보 관리 API")
public class UserController {

    private final UserService userService;
    private final ProductQueryService productQueryService;

    @Operation(summary = "사용자 프로필 조회", description = "로그인한 사용자의 프로필 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "프로필 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "사용자 정보를 찾을 수 없음")
    })
    @GetMapping("/me")
    public ResponseEntity<ResponseDTO<UserDto.UserResponse>> getProfile(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        // 현재 인증된 사용자의 프로필 조회

        log.info("사용자 프로필 조회: {}", userDetails.getUserId());
        UserDto.UserResponse response = userService.getUserProfile(userDetails.getUserId());
        return ResponseEntity.ok(ResponseDTO.success(response, "프로필 조회에 성공했습니다."));
    }

    @Operation(summary = "사용자 프로필 수정", description = "로그인한 사용자의 이름과 전화번호를 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "프로필 수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "사용자 정보를 찾을 수 없음")
    })
    @PatchMapping("/me")
    public ResponseEntity<ResponseDTO<UserDto.UserResponse>> updateProfile(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "프로필 수정 정보", required = true)
            @Valid @RequestBody UserDto.ProfileUpdateRequest request) {

        log.info("사용자 프로필 수정: {}", userDetails.getUserId());
        UserDto.UserResponse response = userService.updateProfile(userDetails.getUserId(), request);
        return ResponseEntity.ok(ResponseDTO.success(response, "프로필이 성공적으로 수정되었습니다."));
    }

    @Operation(summary = "비밀번호 변경", description = "현재 비밀번호 확인 후 새 비밀번호로 변경합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "비밀번호 변경 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 또는 현재 비밀번호 불일치"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "사용자 정보를 찾을 수 없음")
    })
    @PostMapping("/me/password")
    public ResponseEntity<ResponseDTO<Void>> changePassword(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "비밀번호 변경 정보", required = true)
            @Valid @RequestBody UserDto.PasswordChangeRequest request) {

        log.info("비밀번호 변경 요청: {}", userDetails.getUserId());
        userService.changePassword(userDetails.getUserId(), request);
        return ResponseEntity.ok(ResponseDTO.success(null, "비밀번호가 성공적으로 변경되었습니다."));
    }

    @Operation(summary = "판매자 기본 정보 조회", description = "판매자의 기본 정보와 통계를 조회합니다.")
    @GetMapping("/{sellerId}/seller-info")
    public ResponseEntity<ResponseDTO<UserDto.SellerDetailResponse>> getSellerInfo(
            @Parameter(description = "조회할 사용자 ID", required = true) @PathVariable Long sellerId) {

        UserDto.SellerDetailResponse response = userService.getSellerInfo(sellerId);
        return ResponseEntity.ok(ResponseDTO.success(response));
    }

    @Operation(
            summary = "판매자 상품 목록 조회",
            description = "판매자의 상품 목록을 상태별로 조회합니다. 상태를 지정하지 않으면 모든 상품을 조회합니다." +
                    "예시 -> GET /api/users/123/products?status=ACTIVE&sort=createdDate,desc"
    )
    @GetMapping("/{sellerId}/products")
    public ResponseEntity<ResponseDTO<Page<ProductDto.ProductResponse>>> getSellerProducts(
            @Parameter(description = "판매자 ID", required = true)
            @PathVariable Long sellerId,

            @Parameter(description = "상품 상태 (ACTIVE: 판매중, SOLD_OUT: 판매완료, 미지정시 전체)")
            @RequestParam(required = false) ProductStatus status,

            @Parameter(description = "페이지 정보 (기본: 10개씩, 최신순)")
            @PageableDefault(size = 10, sort = "createdDate", direction = Sort.Direction.DESC)
            Pageable pageable,

            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long currentUserId = userDetails != null ? userDetails.getUserId() : null;
        Page<ProductDto.ProductResponse> response = productQueryService.getProductsBySeller(
                sellerId, status, pageable, currentUserId);

        return ResponseEntity.ok(ResponseDTO.success(response));
    }
}
