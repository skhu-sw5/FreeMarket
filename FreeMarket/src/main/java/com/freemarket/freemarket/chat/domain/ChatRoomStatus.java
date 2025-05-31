package com.freemarket.freemarket.chat.domain;

public enum ChatRoomStatus {
    ACTIVE("활성"),
    CLOSED("종료"),
    BLOCKED("차단됨");

    private final String displayName;
    ChatRoomStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
