package com.freemarket.freemarket.user.api.dto;

import com.freemarket.freemarket.product.api.dto.ProductDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

public class UserProfileDto {

    @Builder
    @Schema(description = "판매 내역 페이지 응답")
    public record SellingHistoryResponse(
        @Schema(description = "판매 중인 상품 목록")
        List<ProductSummaryResponse> activeProducts,
        
        @Schema(description = "판매 완료된 상품 목록")
        List<ProductSummaryResponse> soldProducts,
        
        @Schema(description = "총 상품 수", example = "10")
        int totalProductCount
    ) {}

    @Builder
    @Schema(description = "구매 내역 페이지 응답")
    public record PurchaseHistoryResponse(
            @Schema(description = "구매 내역 목록")
            List<ProductSummaryResponse> purchases,
            
            @Schema(description = "총 구매 수", example = "5")
            int totalPurchaseCount
    ) {}

    @Builder
    @Schema(description = "사용자 프로필에서 사용하는 상품 요약 정보")
    public record ProductSummaryResponse(
            @Schema(description = "상품 ID")
            Long id,
            @Schema(description = "상품명")
            String name,
            @Schema(description = "상품 설명")
            String description,
            @Schema(description = "가격")
            Long price,
            @Schema(description = "재고 수량")
            Integer stock,
            @Schema(description = "카테고리")
            String category,
            @Schema(description = "상태")
            String status,
            @Schema(description = "썸네일 URL")
            String thumbnailUrl,
            @Schema(description = "이미지 URL 목록")
            List<String> imageUrls,
            @Schema(description = "판매자 ID")
            Long sellerId,
            @Schema(description = "판매자 이름")
            String sellerName,
            @Schema(description = "조회수")
            Long viewCount,
            @Schema(description = "관심 등록 수")
            Long wishlistCount,
            @Schema(description = "현재 사용자의 관심 등록 여부")
            boolean isWishlisted
    ) {
        // Product 엔티티와 추가 정보로부터 DTO 생성하는 정적 메서드
        public static ProductSummaryResponse from(
                com.freemarket.freemarket.product.domain.Product product,
                Long viewCount,
                Long wishlistCount,
                boolean isWishlisted) {

            return ProductSummaryResponse.builder()
                    .id(product.getId())
                    .name(product.getName())
                    .description(product.getDescription())
                    .price(product.getPrice())
                    .stock(product.getStock())
                    .category(product.getCategory().getDisplayName())
                    .status(product.getStatus().getDisplayName())
                    .thumbnailUrl(product.getRepresentativeThumbnailUrl())
                    .imageUrls(product.getImages().stream()
                            .map(image -> image.getImageUrl())
                            .collect(java.util.stream.Collectors.toList()))
                    .sellerId(product.getSeller().getId())
                    .sellerName(product.getSeller().getName())
                    .viewCount(viewCount)
                    .wishlistCount(wishlistCount)
                    .isWishlisted(isWishlisted)
                    .build();
        }
    }

    @Builder
    @Schema(description = "프로필 요약 정보")
    public record ProfileSummaryResponse(
            @Schema(description = "사용자 ID", example = "1")
            Long userId,
            
            @Schema(description = "이메일", example = "user@example.com")
            String email,
            
            @Schema(description = "이름", example = "홍길동")
            String name,
            
            @Schema(description = "총 판매 중인 상품 수", example = "3")
            int totalSellingCount,
            
            @Schema(description = "총 판매 완료 수", example = "7")
            int totalSoldCount,
            
            @Schema(description = "총 구매 수", example = "15")
            int totalPurchaseCount,
            
            @Schema(description = "평균 평점", example = "4.5")
            double averageRating,
            
            @Schema(description = "가입 날짜", example = "2025-01-01T09:00:00")
            LocalDateTime joinDate
    ) {}
}
