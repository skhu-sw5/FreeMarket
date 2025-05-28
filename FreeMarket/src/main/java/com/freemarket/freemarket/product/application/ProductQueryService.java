package com.freemarket.freemarket.product.application;

import com.freemarket.freemarket.product.api.dto.ProductDto;
import com.freemarket.freemarket.product.api.dto.ProductWithStatsDto;
import com.freemarket.freemarket.product.domain.Product;
import com.freemarket.freemarket.product.domain.ProductCategory;
import com.freemarket.freemarket.product.domain.ProductSort;
import com.freemarket.freemarket.product.domain.repository.ProductRepository;
import com.freemarket.freemarket.product.domain.ProductStatus;
import com.freemarket.freemarket.product.exception.ProductException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProductQueryService {

    private final ProductRepository productRepository;
    private final ProductViewService viewService;
    private final ProductWishlistService wishlistService;

    // 상품 단건 조회
    public ProductDto.ProductDetailResponse getProduct(Long productId, Long userId) {
        Product product = findProduct(productId);

        // 조회수
        Long viewCount = viewService.getViewCount(productId);
        // 관심 등록 수
        Long wishlistCount = wishlistService.getWishlistCount(productId);

        // 현재 사용자의 관심 등록 여부
        boolean isWishlisted = userId != null ? wishlistService.isWishlisted(userId, productId) : false;
        return ProductDto.ProductDetailResponse.from(product, viewCount, wishlistCount, isWishlisted);
    }

    // 상품 목록 조회
    public Page<ProductDto.ProductDetailResponse> getFilteredProducts(ProductCategory category, String keyword, ProductStatus status,
                                                              Long minPrice, Long maxPrice, ProductSort sort,
                                                              Pageable pageable, Long userId) {
        return productRepository.findProductsWithFilters(category, keyword, status, minPrice, maxPrice, sort, pageable, userId)
                .map(ProductWithStatsDto::toProductDetailResponse);
    }


    private Product findProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ProductException.ProductNotFoundException(productId));
    }
}
