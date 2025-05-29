package com.freemarket.freemarket.product.application;

import com.freemarket.freemarket.product.api.dto.ProductDto;
import com.freemarket.freemarket.product.api.dto.ProductWithStatsDto;
import com.freemarket.freemarket.product.domain.Product;
import com.freemarket.freemarket.product.domain.ProductCategory;
import com.freemarket.freemarket.product.domain.ProductSort;
import com.freemarket.freemarket.product.domain.repository.ProductRepository;
import com.freemarket.freemarket.product.domain.ProductStatus;
import com.freemarket.freemarket.product.exception.ProductException;
import com.freemarket.freemarket.user.domain.repository.UserRepository;
import com.freemarket.freemarket.user.exception.UserException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProductQueryService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
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

    // 판매자별 상품 조회
    public Page<ProductDto.ProductDetailResponse> getProductsBySeller(
            Long sellerId,
            ProductStatus status,
            Pageable pageable,
            Long currentUserId) {

        // 판매자 존재 확인
        validateSellerExists(sellerId);

        Page<Product> productPage;
        if (status != null) {
            productPage = productRepository.findBySellerIdAndStatusWithImages(sellerId, status, pageable);
        } else {
            productPage = productRepository.findBySellerIdWithImages(sellerId, pageable);
        }

        return productPage.map(product -> convertToDetailResponse(product, currentUserId));
    }

    // 판매자별 상품 수 조회
    public int getProductCountBySeller(Long sellerId, ProductStatus status) {
        validateSellerExists(sellerId);

        if (status != null) {
            return (int) productRepository.countBySellerIdAndStatus(sellerId, status);
        } else {
            return (int) productRepository.countBySellerId(sellerId);
        }
    }

    private void validateSellerExists(Long sellerId) {
        if (!userRepository.existsById(sellerId)) {
            throw new UserException.UserNotFoundException(sellerId);
        }
    }

    private ProductDto.ProductDetailResponse convertToDetailResponse(Product product, Long userId) {
        Long viewCount = viewService.getViewCount(product.getId());
        Long wishlistCount = wishlistService.getWishlistCount(product.getId());
        boolean isWishlisted = userId != null && wishlistService.isWishlisted(userId, product.getId());

        return ProductDto.ProductDetailResponse.from(product, viewCount, wishlistCount, isWishlisted);
    }


    private Product findProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ProductException.ProductNotFoundException(productId));
    }
}
