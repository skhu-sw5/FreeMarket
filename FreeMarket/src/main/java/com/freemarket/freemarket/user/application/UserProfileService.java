package com.freemarket.freemarket.user.application;

import com.freemarket.freemarket.product.api.dto.ProductDto;
import com.freemarket.freemarket.product.domain.*;
import com.freemarket.freemarket.review.application.ReviewService;
import com.freemarket.freemarket.user.api.dto.UserProfileDto;
import com.freemarket.freemarket.user.domain.User;
import com.freemarket.freemarket.user.domain.UserRepository;
import com.freemarket.freemarket.user.exception.UserException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.View;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ReviewService reviewService;
    private final ProductViewCountRepository viewCountRepository;
    private final ProductWishlistRepository wishlistRepository;

    // 사용자의 프로필 요약 정보를 조회
    public UserProfileDto.ProfileSummaryResponse getProfileSummary(Long userId) {
        User user = getUser(userId);

        // 판매 중인 상품 수
        long activeProductCount = productRepository.countBySellerIdAndStatus(userId, ProductStatus.ACTIVE);

        // 판매 완료된 상품 수
        long soldProductCount = productRepository.countBySellerIdAndStatus(userId, ProductStatus.SOLD_OUT);

        // 구매한 상품 수
        long purchaseCount = productRepository.countByBuyerId(userId);

        // 평균 평점 조회
        double averageRating = reviewService.getUserAverageRating(userId);

        return UserProfileDto.ProfileSummaryResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .totalSellingCount((int) activeProductCount)
                .totalSoldCount((int) soldProductCount)
                .totalPurchaseCount((int) purchaseCount)
                .averageRating(averageRating)
                .joinDate(user.getCreatedDate())
                .build();
    }

    // 사용자의 판매 상품 내역을 조회
    public UserProfileDto.SellingHistoryResponse getSellingHistoryDetail(Long userId, Pageable pageable) {
        // 판매중인 상품 조회
        Page<Product> activeProductsPage = productRepository.findBySellerIdAndStatus(userId, ProductStatus.ACTIVE, pageable);

        // 판매 완료된 상품 조회
        Page<Product> soldProductsPage = productRepository.findBySellerIdAndStatus(userId, ProductStatus.SOLD_OUT, pageable);

        List<UserProfileDto.ProductSummaryResponse> activeProductResponses =
                activeProductsPage.stream().map(product -> convertToProductSummaryResponse(product, userId))
                        .toList();

        List<UserProfileDto.ProductSummaryResponse> soldProductResponses =
                soldProductsPage.stream().map(product -> convertToProductSummaryResponse(product, userId))
                        .collect(Collectors.toList());

        return UserProfileDto.SellingHistoryResponse.builder()
                .activeProducts(activeProductResponses)
                .soldProducts(soldProductResponses)
                .totalProductCount((int) (activeProductsPage.getTotalElements() + soldProductsPage.getTotalElements()))
                .build();
    }

    // 구매 내역 조회
    public UserProfileDto.PurchaseHistoryResponse getPurchaseHistoryDetail(Long userId, Pageable pageable) {
        Page<Product> purchasedProductsPage = productRepository.findByBuyerIdOrderBySoldDateDesc(userId, pageable);

        List<UserProfileDto.ProductSummaryResponse> purchaseResponses = purchasedProductsPage.getContent().stream()
                .map(product -> convertToProductSummaryResponse(product, userId))
                .toList();

        return UserProfileDto.PurchaseHistoryResponse.builder()
                .purchases(purchaseResponses)
                .totalPurchaseCount((int) purchasedProductsPage.getTotalElements())
                .build();
    }
    private UserProfileDto.ProductSummaryResponse convertToProductSummaryResponse(Product product, Long userId) {
        // 조회수 정보 가져오기
        Long viewCount = viewCountRepository.findByProductId(product.getId())
                .map(ProductViewCount::getCount)
                .orElse(0L);

        // 관심 등록 수 가져오기
        Long wishlistCount = wishlistRepository.countByProductId(product.getId());

        // 현재 사용자의 관심 등록 여부 확인
        boolean isWishlisted = false; // 기본값
        if (userId != null) {
            User user = getUser(userId);
            isWishlisted = wishlistRepository.existsByUserAndProduct(user, product);
        }

        return UserProfileDto.ProductSummaryResponse.from(product, viewCount, wishlistCount, isWishlisted);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserException.UserNotFoundException(userId));
    }
}
