package com.freemarket.freemarket.product.domain.repository;

import com.freemarket.freemarket.product.api.dto.ProductWithStatsDto;
import com.freemarket.freemarket.product.domain.Product;
import com.freemarket.freemarket.product.domain.ProductCategory;
import com.freemarket.freemarket.product.domain.ProductSort;
import com.freemarket.freemarket.product.domain.ProductStatus;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.freemarket.freemarket.product.domain.QProduct.product;
import static com.freemarket.freemarket.product.domain.QProductImage.productImage;
import static com.freemarket.freemarket.product.domain.QProductViewCount.productViewCount;
import static com.freemarket.freemarket.product.domain.QProductWishlist.productWishlist;

@RequiredArgsConstructor
public class ProductRepositoryImpl implements ProductRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<ProductWithStatsDto> findProductsWithFilters(ProductCategory category, String keyword,
                                                                        ProductStatus status, Long minPrice, Long maxPrice,
                                                                        ProductSort sort, Pageable pageable, Long userId) {
        // 카테고리를 포함한 기본 조건 생성
        BooleanBuilder builder = createBasicCondition(keyword, status, category);

        // 가격 범위 조건 추가
        addPriceCondition(builder, minPrice, maxPrice);

        return fetchOptimizedPagedProductsWithStats(builder, sort, pageable, userId);
    }

    // 가격 범위 조건 추가 메서드
    private void addPriceCondition(BooleanBuilder builder, Long minPrice, Long maxPrice) {
        if (minPrice != null) {
            builder.and(product.price.goe(minPrice));
        }
        if (maxPrice != null) {
            builder.and(product.price.loe(maxPrice));
        }
    }

    // 최적화된 페이징 조회 메서드
    private Page<ProductWithStatsDto> fetchOptimizedPagedProductsWithStats(BooleanBuilder builder,
                                                                           ProductSort sort,
                                                                           Pageable pageable,
                                                                           Long userId) {
        // 정렬 조건에 따라 최적화된 쿼리 수행
        final List<Long> productIds;

        // 정렬 기준에 따라 최적화된 쿼리 생성
        switch (sort) {
            case VIEW_COUNT -> {
                // 조회수 기준 정렬시 조회수 테이블과 함께 조회
                productIds = queryFactory
                        .select(product.id)
                        .from(product)
                        .leftJoin(productViewCount).on(productViewCount.product.eq(product))
                        .where(builder)
                        .orderBy(productViewCount.count.coalesce(0L).desc(), product.id.desc())
                        .offset(pageable.getOffset())
                        .limit(pageable.getPageSize())
                        .fetch();
            }
            case WISH_COUNT -> {
                // 관심수 기준 정렬 시 관심수 계산 - 서브쿼리를 이용한 정렬
                // 서브쿼리 결과를 정렬에 사용
                productIds = queryFactory
                        .select(product.id)
                        .from(product)
                        .leftJoin(productWishlist).on(productWishlist.product.eq(product))
                        .where(builder)
                        .groupBy(product.id)
                        .orderBy(productWishlist.count().coalesce(0L).desc(), product.id.desc())
                        .offset(pageable.getOffset())
                        .limit(pageable.getPageSize())
                        .fetch();
            }
            case PRICE_ASC -> {
                // 낮은 가격순
                productIds = queryFactory
                        .select(product.id)
                        .from(product)
                        .where(builder)
                        .orderBy(product.price.asc(), product.id.desc())
                        .offset(pageable.getOffset())
                        .limit(pageable.getPageSize())
                        .fetch();
            }
            case PRICE_DESC -> {
                // 높은 가격순
                productIds = queryFactory
                        .select(product.id)
                        .from(product)
                        .where(builder)
                        .orderBy(product.price.desc(), product.id.desc())
                        .offset(pageable.getOffset())
                        .limit(pageable.getPageSize())
                        .fetch();
            }
            default -> {
                // 기본 최신순
                productIds = queryFactory
                        .select(product.id)
                        .from(product)
                        .where(builder)
                        .orderBy(product.createdDate.desc(), product.id.desc())
                        .offset(pageable.getOffset())
                        .limit(pageable.getPageSize())
                        .fetch();
            }
        }

        if (productIds.isEmpty()) {
            return Page.empty(pageable);
        }

        // 상품 정보 일괄 조회 (N+1 문제 방지를 위한 Fetch Join)
        Map<Long, Product> productMap = queryFactory
                .selectFrom(product)
                .leftJoin(product.images, productImage).fetchJoin()
                .where(product.id.in(productIds))
                .fetch()
                .stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        // 조회수 정보 일괄 조회
        final Map<Long, Long> viewCountMap = queryFactory
                .select(productViewCount.product.id, productViewCount.count)
                .from(productViewCount)
                .where(productViewCount.product.id.in(productIds))
                .fetch()
                .stream()
                .collect(Collectors.toMap(
                        tuple -> tuple.get(productViewCount.product.id),
                        tuple -> tuple.get(productViewCount.count),
                        (a, b) -> a
                ));

        // 관심 등록 수 일괄 조회
        final Map<Long, Long> wishlistCountMap = queryFactory
                .select(productWishlist.product.id, productWishlist.count())
                .from(productWishlist)
                .where(productWishlist.product.id.in(productIds))
                .groupBy(productWishlist.product.id)
                .fetch()
                .stream()
                .collect(Collectors.toMap(
                        tuple -> tuple.get(productWishlist.product.id),
                        tuple -> tuple.get(productWishlist.count()),
                        (a, b) -> a
                ));

        // 사용자의 관심 등록 여부 일괄 조회
        final Map<Long, Boolean> isWishlistedMap;
        if (userId != null) {
            isWishlistedMap = queryFactory
                    .select(productWishlist.product.id)
                    .from(productWishlist)
                    .where(productWishlist.product.id.in(productIds)
                            .and(productWishlist.user.id.eq(userId)))
                    .fetch()
                    .stream()
                    .collect(Collectors.toMap(
                            productId -> productId,
                            productId -> true,
                            (a, b) -> a
                    ));
        } else {
            isWishlistedMap = new HashMap<>();
        }

        // 결과 DTO 생성 (ID 목록 순서 유지)
        List<ProductWithStatsDto> result = productIds.stream()
                .map(id -> {
                    Product p = productMap.get(id);
                    if (p == null) return null; // 이론적으로 발생할 수 없지만 안전장치

                    Long viewCount = viewCountMap.getOrDefault(id, 0L);
                    Long wishlistCount = wishlistCountMap.getOrDefault(id, 0L);
                    boolean isWishlisted = isWishlistedMap.getOrDefault(id, false);

                    return new ProductWithStatsDto(p, viewCount, wishlistCount, isWishlisted);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // 전체 개수 조회를 위한 쿼리
        JPAQuery<Long> countQuery = queryFactory
                .select(product.count())
                .from(product)
                .where(builder);

        // 페이지 객체 생성 (count 쿼리 최적화)
        return PageableExecutionUtils.getPage(result, pageable, countQuery::fetchOne);
    }

    // 공통 조건을 사용하여 BooleanBuilder 생성하는 메서드
    private BooleanBuilder createBasicCondition(String keyword, ProductStatus status, ProductCategory category) {
        BooleanBuilder builder = new BooleanBuilder();

        // 카테고리 조건 (선택적)
        if (category != null) {
            builder.and(product.category.eq(category));
        }

        // 키워드 검색 조건 추가
        if (StringUtils.hasText(keyword)) {
            builder.and(nameOrDescriptionContains(keyword));
        }

        // 상품 상태 조건 추가
        if (status != null) {
            builder.and(product.status.eq(status));
        } else {
            // 기본적으로 활성 상품만 조회 (ACTIVE)
            builder.and(product.status.eq(ProductStatus.ACTIVE));
        }

        return builder;
    }

    // 상품명 또는 설명에 키워드가 포함된 조건
    private BooleanExpression nameOrDescriptionContains(String keyword) {
        return product.name.containsIgnoreCase(keyword)
                .or(product.description.containsIgnoreCase(keyword));
    }
}
