package com.freemarket.freemarket.product.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductViewCountRepository extends JpaRepository<ProductViewCount, Long> {
    Optional<ProductViewCount> findByProductId(Long productId);
    
    @Modifying
    @Query("DELETE FROM ProductViewCount pvc WHERE pvc.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
