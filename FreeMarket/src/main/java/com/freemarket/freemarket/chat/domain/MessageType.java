package com.freemarket.freemarket.chat.domain;

public enum MessageType {
    TEXT("텍스트"),
    IMAGE("이미지"),
    SYSTEM("시스템");

    private final String displayName;

    MessageType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
