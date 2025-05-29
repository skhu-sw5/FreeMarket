package com.freemarket.freemarket.product.application;

import com.freemarket.freemarket.product.api.dto.ProductDto;
import com.freemarket.freemarket.product.domain.Product;
import com.freemarket.freemarket.product.domain.repository.ProductRepository;
import com.freemarket.freemarket.product.domain.ProductWishlist;
import com.freemarket.freemarket.product.domain.repository.ProductWishlistRepository;
import com.freemarket.freemarket.product.exception.ProductException;
import com.freemarket.freemarket.user.domain.User;
import com.freemarket.freemarket.user.domain.repository.UserRepository;
import com.freemarket.freemarket.user.exception.UserException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProductWishlistService {

    private final ProductWishlistRepository productWishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductViewService viewService;

    @Transactional
    public boolean toggleWishlist(Long userId, Long productId) {
        User user = getUser(userId);
        Product product = getProduct(productId);

        boolean exists = productWishlistRepository.existsByUserAndProduct(user, product);

        if (exists) {
            productWishlistRepository.deleteByUserAndProduct(user, product);
            return false; // 관심 상품 취소
        } else {
            ProductWishlist wishlist = ProductWishlist.builder()
                    .user(user)
                    .product(product)
                    .build();
            productWishlistRepository.save(wishlist);
            return true; // 관심 상품 등록
        }
    }

    public List<Product> getUserWishlist(Long userId) {
        User user = getUser(userId);
        return productWishlistRepository.findAllByUser(user).stream()
                .map(ProductWishlist::getProduct)
                .collect(Collectors.toList());
    }

    public List<ProductDto.ProductResponse> getUserWishlistDetailDto(Long userId) {
        User user = getUser(userId);
        return productWishlistRepository.findAllByUser(user).stream()
                .map(wishlist -> {
                    Product product = wishlist.getProduct();

                    Long viewCount = viewService.getViewCount(product.getId());
                    Long wishlistCount = getWishlistCount(product.getId());
                    // 이미 위시리스트에서 가져온 상품이므로 무조건 true
                    boolean isWishlisted = true;

                    return ProductDto.ProductResponse.from(product, viewCount, wishlistCount, isWishlisted);
                })
                .toList();
    }

    public boolean isWishlisted(Long userId, Long productId) {
        if (userId == null) {
            return false;
        }

        User user = getUser(userId);
        Product product = getProduct(productId);

        return productWishlistRepository.existsByUserAndProduct(user, product);
    }

    public Long getWishlistCount(Long productId) {
        return productWishlistRepository.countByProductId(productId);
    }

    public List<ProductDto.ProductResponse> getUserWishlistDto(Long userId) {
        User user = getUser(userId);
        return productWishlistRepository.findAllByUser(user).stream()
                .map(wishlist -> ProductDto.ProductResponse.from(wishlist.getProduct()))
                .collect(Collectors.toList());
    }
    private Product getProduct(Long productId) {
        return productRepository.findById(productId).orElseThrow(() -> new ProductException.ProductNotFoundException(productId));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new UserException.UserNotFoundException(userId));
    }
}
