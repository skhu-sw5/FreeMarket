package com.freemarket.freemarket.user.api.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

public class UserProfileDto {

    // 판매 상품 내역 DTO
    @Builder
    public record SellingProductResponse(
            Long productId,
            String name,
            Long price,
            String category,
            String status,
            String thumbnailUrl,
            String buyerName,
            LocalDateTime soldDate,
            LocalDateTime createdDate
    ) {}

    // 판매 내역 페이지 응답 DTO
    @Builder
    public record SellingHistoryResponse(
        List<SellingProductResponse> activeProducts,
        List<SellingProductResponse> soldProducts,
        int totalProductCount
    ) {}

    // 구매 내역 DTO
    @Builder
    public record PurchaseItem(
        Long productId,
        String productName,
        Long price,
        String category,
        String thumbnailUrl,
        String sellerName,
        LocalDateTime purchaseDate
    ) {}

    // 구매 내역 페이지 응답 DTO
    @Builder
    public record PurchaseHistoryResponse(
            List<PurchaseItem> purchases,
            int totalPurchaseCount
    ) {}

    // 프로필 요약 정보 DTO
    @Builder
    public record ProfileSummaryResponse(
            Long userId,
            String email,
            String name,
            int totalSellingCount,
            int totalSoldCount,
            int totalPurchaseCount,
            double averageRating,
            LocalDateTime joinDate
    ) {}
}
