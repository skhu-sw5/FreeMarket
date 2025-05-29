package com.freemarket.freemarket.product.api.dto;

import com.freemarket.freemarket.product.domain.Product;
import com.freemarket.freemarket.product.domain.ProductCategory;
import com.freemarket.freemarket.product.domain.ProductImage;
import com.freemarket.freemarket.product.domain.ProductStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class ProductDto {

    @Schema(description = "상품 생성 요청")
    public record CreateRequest(
            @Schema(description = "상품명", example = "새 노트북")
            @NotBlank(message = "상품명은 필수 입력값입니다.")
            String name,

            @Schema(description = "상품 설명", example = "거의 사용하지 않은 노트북입니다.")
            String description,

            @Schema(description = "가격", example = "1000000")
            @NotNull(message = "가격은 필수 입력값입니다.")
            @Min(value = 0)
            Long price,

            @Schema(description = "재고 수량", example = "1")
            @NotNull(message = "재고는 필수 입력값입니다.")
            @Min(value = 1, message = "재고는 최소 1개 이상이어야 합니다.")
            Integer stock,

            @Schema(description = "상품 카테고리", example = "ELECTRONICS")
            @NotNull(message = "카테고리는 필수 입력값입니다.")
            ProductCategory category
    ) {}

    @Schema(description = "상품 수정 요청")
    public record UpdateRequest(
            @Schema(description = "상품명", example = "새 노트북")
            @NotBlank(message = "상품명은 필수 입력값입니다.")
            String name,

            @Schema(description = "상품 설명", example = "거의 사용하지 않은 노트북입니다.")
            String description,

            @Schema(description = "가격", example = "900000")
            @NotNull(message = "가격은 필수 입력값입니다.")
            @Min(value = 100, message = "가격은 최소 100원 이상이어야 합니다.")
            Long price,

            @Schema(description = "재고 수량", example = "1")
            @NotNull(message = "재고는 필수 입력값입니다.")
            @Min(value = 1, message = "재고는 최소 1개 이상이어야 합니다.")
            Integer stock,

            @Schema(description = "상품 카테고리", example = "ELECTRONICS")
            @NotNull(message = "카테고리는 필수 입력값입니다.")
            ProductCategory category,

            @Schema(description = "상품 상태", example = "ACTIVE")
            ProductStatus status
    ) {}

    // 통합된 상품 응답 DTO - 모든 API에서 사용
    @Builder
    @Schema(description = "상품 응답")
    public record ProductResponse(
            @Schema(description = "상품 ID", example = "1")
            Long id,

            @Schema(description = "상품명", example = "새 노트북")
            String name,

            @Schema(description = "상품 설명", example = "거의 사용하지 않은 노트북입니다.")
            String description,

            @Schema(description = "가격", example = "1000000")
            Long price,

            @Schema(description = "재고 수량", example = "1")
            Integer stock,

            @Schema(description = "카테고리 표시명", example = "전자기기")
            String category,

            @Schema(description = "상품 상태", example = "판매중")
            String status,

            @Schema(description = "썸네일 이미지 URL", example = "https://example.com/thumbnail.jpg")
            String thumbnailUrl,

            @Schema(description = "이미지 URL 목록")
            List<String> imageUrls,

            @Schema(description = "판매자 ID", example = "123")
            Long sellerId,

            @Schema(description = "판매자 이름", example = "홍길동")
            String sellerName,

            @Schema(description = "상품 등록일", example = "2025-01-15T10:30:00")
            LocalDateTime createdDate,

            @Schema(description = "상품 수정일", example = "2025-01-16T14:20:00")
            LocalDateTime updatedDate,

            @Schema(description = "조회수", example = "42")
            Long viewCount,

            @Schema(description = "관심 등록 수", example = "7")
            Long wishlistCount,

            @Schema(description = "현재 사용자의 관심 등록 여부", example = "true")
            boolean isWishlisted
    ) {
        // 완전한 정보로 생성 (상세 조회, 목록 조회용)
        public static ProductResponse from(Product product, Long viewCount, Long wishlistCount, boolean isWishlisted) {
            return ProductResponse.builder()
                    .id(product.getId())
                    .name(product.getName())
                    .description(product.getDescription())
                    .price(product.getPrice())
                    .stock(product.getStock())
                    .category(product.getCategory().getDisplayName())
                    .status(product.getStatus().getDisplayName())
                    .thumbnailUrl(product.getRepresentativeThumbnailUrl())
                    .imageUrls(product.getImages().stream()
                            .map(ProductImage::getImageUrl)
                            .collect(Collectors.toList()))
                    .sellerId(product.getSeller().getId())
                    .sellerName(product.getSeller().getName())
                    .createdDate(product.getCreatedDate())
                    .updatedDate(product.getUpdatedDate())
                    .viewCount(viewCount != null ? viewCount : 0L)
                    .wishlistCount(wishlistCount != null ? wishlistCount : 0L)
                    .isWishlisted(isWishlisted)
                    .build();
        }

        // 기본 정보만으로 생성 (등록, 수정 결과용 - 통계 정보 없음)
        public static ProductResponse from(Product product) {
            return from(product, 0L, 0L, false);
        }
    }
}
