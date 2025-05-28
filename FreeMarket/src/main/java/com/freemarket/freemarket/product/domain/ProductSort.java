package com.freemarket.freemarket.product.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ProductSort {
    LATEST("최신순"),
    PRICE_ASC("낮은 가격순"),
    PRICE_DESC("높은 가격순"),
    VIEW_COUNT("조회수순"),
    WISH_COUNT("관심수순");

    private final String displayName;
}
