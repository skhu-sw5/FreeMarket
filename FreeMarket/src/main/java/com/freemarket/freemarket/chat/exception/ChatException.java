package com.freemarket.freemarket.chat.exception;

import com.freemarket.freemarket.global.exception.BaseException;
import org.springframework.http.HttpStatus;

public class ChatException extends BaseException {

    public static class ChatRoomNotFoundException extends ChatException {
        public ChatRoomNotFoundException(Long chatRoomId) {
            super("해당 채팅방을 찾을 수 없습니다: " + chatRoomId, HttpStatus.NOT_FOUND, "CHAT_ROOM_NOT_FOUND");
        }
        
        public ChatRoomNotFoundException(String message) {
            super(message, HttpStatus.NOT_FOUND, "CHAT_ROOM_NOT_FOUND");
        }
    }

    public static class ChatRoomAccessDeniedException extends ChatException {
        public ChatRoomAccessDeniedException() {
            super("채팅방에 접근할 권한이 없습니다.", HttpStatus.FORBIDDEN, "CHAT_ROOM_ACCESS_DENIED");
        }
    }

    public static class SelfChatNotAllowedException extends ChatException {
        public SelfChatNotAllowedException() {
            super("자신의 상품에 대해서는 채팅을 할 수 없습니다.", HttpStatus.BAD_REQUEST, "SELF_CHAT_NOT_ALLOWED");
        }
    }

    public static class ChatRoomInactiveException extends ChatException {
        public ChatRoomInactiveException() {
            super("비활성화된 채팅방입니다.", HttpStatus.BAD_REQUEST, "CHAT_ROOM_INACTIVE");
        }
    }

    public static class MessageNotFoundException extends ChatException {
        public MessageNotFoundException(Long messageId) {
            super("해당 메시지를 찾을 수 없습니다: " + messageId, HttpStatus.NOT_FOUND, "MESSAGE_NOT_FOUND");
        }
    }

    public ChatException(String message, HttpStatus status, String errorCode) {
        super(message, status, errorCode);
    }
}
