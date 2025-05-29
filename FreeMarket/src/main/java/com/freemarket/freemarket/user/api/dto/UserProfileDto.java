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
        List<ProductDto.ProductResponse> activeProducts,
        
        @Schema(description = "판매 완료된 상품 목록")
        List<ProductDto.ProductResponse> soldProducts,
        
        @Schema(description = "총 상품 수", example = "10")
        int totalProductCount
    ) {}

    @Builder
    @Schema(description = "구매 내역 페이지 응답")
    public record PurchaseHistoryResponse(
            @Schema(description = "구매 내역 목록")
            List<ProductDto.ProductResponse> purchases,
            
            @Schema(description = "총 구매 수", example = "5")
            int totalPurchaseCount
    ) {}

}
