package com.freemarket.freemarket.product.domain.repository;

import com.freemarket.freemarket.product.domain.Product;
import com.freemarket.freemarket.product.domain.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, ProductRepositoryCustom {
    // 판매자 ID와 상품 상태로 상품 목록 조회
    Page<Product> findBySellerIdAndStatus(Long sellerId, ProductStatus status, Pageable pageable);

    // 판매자 ID와 상품 상태로 상품 개수 조회
    long countBySellerIdAndStatus(Long sellerId, ProductStatus status);

    // 구매자 ID로 상품 목록 조회
    Page<Product> findByBuyerIdOrderBySoldDateDesc(Long buyerId, Pageable pageable);

    // 구매자 ID로 상품 개수 조회
    long countByBuyerId(Long buyerId);

    /**
     * 판매자의 특정 상태 상품을 이미지와 함께 조회 (Fetch Join 사용)
     * N+1 문제 해결을 위해 이미지를 함께 로드
     */
    @Query("select distinct p from Product p " +
            "left join fetch p.images pi " +
            "left join fetch p.seller " +
            "where p.seller.id = :sellerId " +
            "and p.status = :status")
    Page<Product> findBySellerIdAndStatusWithImages(@Param("sellerId") Long sellerId,
                                                    @Param("status") ProductStatus status,
                                                    Pageable pageable);

    // 판매자의 모든 상품을 이미지와 함께 조회 (상태 무관)
    @Query("select distinct p from Product p " +
            "left join fetch p.images pi " +
            "left join fetch p.seller " +
            "where p.seller.id = :sellerId")
    Page<Product> findBySellerIdWithImages(@Param("sellerId") Long sellerId, Pageable pageable);

    // 판매자의 전체 상품 수 조회 (상태 무관)
    @Query("select count(p) from Product p where p.seller.id = :sellerId")
    long countBySellerId(@Param("sellerId") Long sellerId);
}
