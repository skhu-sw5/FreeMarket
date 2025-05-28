package com.freemarket.freemarket.product.domain.repository;

import com.freemarket.freemarket.product.api.dto.ProductWithStatsDto;
import com.freemarket.freemarket.product.domain.Product;
import com.freemarket.freemarket.product.domain.ProductCategory;
import com.freemarket.freemarket.product.domain.ProductSort;
import com.freemarket.freemarket.product.domain.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductRepositoryCustom {
    Page<ProductWithStatsDto> findProductsWithFilters(ProductCategory category, String keyword,
                                                                 ProductStatus status, Long minPrice, Long maxPrice,
                                                                 ProductSort sort, Pageable pageable, Long userId);
}
