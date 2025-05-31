package com.freemarket.freemarket.chat.api.dto;

import com.freemarket.freemarket.chat.domain.ChatMessage;
import com.freemarket.freemarket.chat.domain.ChatRoom;
import com.freemarket.freemarket.chat.domain.ChatRoomStatus;
import com.freemarket.freemarket.chat.domain.MessageType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

public class ChatRequestDto {

    @Schema(description = "채팅방 생성 요청")
    public record ChatRoomCreateRequest(
            @Schema(description = "상품 ID", example = "1")
            @NotNull(message = "상품 ID는 필수입니다.")
            Long productId
    ) {}

    @Schema(description = "메시지 전송 요청")
    public record MessageSendRequest(
            @Schema(description = "메시지 내용", example = "안녕하세요")
            @NotBlank(message = "메시지 내용은 필수입니다.")
            String content,

            @Schema(description = "메시지 타입", example = "TEXT")
            MessageType messageType
    ) {}

    @Builder
    @Schema(description = "채팅방 응답")
    public record ChatRoomResponse(
            @Schema(description = "채팅방 ID", example = "1")
            Long chatRoomId,

            @Schema(description = "상품 ID", example = "1")
            Long productId,

            @Schema(description = "상품명", example = "중고 노트북")
            String productName,

            @Schema(description = "상품 썸네일 URL")
            String productThumbnailUrl,

            @Schema(description = "판매자 ID", example = "1")
            Long sellerId,

            @Schema(description = "판매자 이름", example = "홍길동")
            String sellerName,

            @Schema(description = "구매자 ID", example = "2")
            Long buyerId,

            @Schema(description = "구매자 이름", example = "김구매")
            String buyerName,

            @Schema(description = "채팅방 상태", example = "ACTIVE")
            ChatRoomStatus status,

            @Schema(description = "마지막 메시지", example = "안녕하세요")
            String lastMessage,

            @Schema(description = "마지막 메시지 시간")
            LocalDateTime lastMessageTime,

            @Schema(description = "생성 시간")
            LocalDateTime createdDate
    ) {
        public static ChatRoomResponse from(ChatRoom chatRoom) {
            return ChatRoomResponse.builder()
                    .chatRoomId(chatRoom.getId())
                    .productId(chatRoom.getProduct().getId())
                    .productName(chatRoom.getProduct().getName())
                    .productThumbnailUrl(chatRoom.getProduct().getRepresentativeThumbnailUrl())
                    .sellerId(chatRoom.getSeller().getId())
                    .sellerName(chatRoom.getSeller().getName())
                    .buyerId(chatRoom.getBuyer().getId())
                    .buyerName(chatRoom.getBuyer().getName())
                    .status(chatRoom.getStatus())
                    .lastMessage(chatRoom.getLastMessage())
                    .lastMessageTime(chatRoom.getLastMessageTime())
                    .createdDate(chatRoom.getCreatedDate())
                    .build();
        }
    }

    @Builder
    @Schema(description = "메시지 응답")
    public record MessageResponse(
            @Schema(description = "메시지 ID", example = "1")
            Long messageId,

            @Schema(description = "채팅방 ID", example = "1")
            Long chatRoomId,

            @Schema(description = "발신자 ID", example = "1")
            Long senderId,

            @Schema(description = "발신자 이름", example = "홍길동")
            String senderName,

            @Schema(description = "메시지 내용", example = "안녕하세요")
            String content,

            @Schema(description = "메시지 타입", example = "TEXT")
            MessageType messageType,

            @Schema(description = "읽음 여부", example = "false")
            boolean isRead,

            @Schema(description = "전송 시간")
            LocalDateTime sentTime
    ) {
        public static MessageResponse from(ChatMessage message) {
            return MessageResponse.builder()
                    .messageId(message.getId())
                    .chatRoomId(message.getChatRoom().getId())
                    .senderId(message.getSender().getId())
                    .senderName(message.getSender().getName())
                    .content(message.getContent())
                    .messageType(message.getMessageType())
                    .isRead(message.isRead())
                    .sentTime(message.getCreatedDate())
                    .build();
        }
    }

    @Builder
    @Schema(description = "채팅방 목록 응답")
    public record ChatRoomListResponse(
            @Schema(description = "채팅방 목록")
            List<ChatRoomResponse> chatRooms,

            @Schema(description = "총 개수", example = "10")
            int totalCount
    ) {}

    @Builder
    @Schema(description = "메시지 목록 응답")
    public record MessageListResponse(
            @Schema(description = "메시지 목록")
            List<MessageResponse> messages,

            @Schema(description = "다음 페이지 존재 여부", example = "true")
            boolean hasNext,

            @Schema(description = "총 개수", example = "50")
            long totalCount
    ) {}
}
