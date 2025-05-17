package com.freemarket.freemarket.product.domain;

import com.freemarket.freemarket.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductWishlistRepository extends JpaRepository<ProductWishlist, Long>, ProductWishlistRepositoryCustom {
    Optional<ProductWishlist> findByUserAndProduct(User user, Product product);
    List<ProductWishlist> findAllByUser(User user);
    boolean existsByUserAndProduct(User user, Product product);
    void deleteByUserAndProduct(User user, Product product);
    
    @Modifying
    @Query("DELETE FROM ProductWishlist pw WHERE pw.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
