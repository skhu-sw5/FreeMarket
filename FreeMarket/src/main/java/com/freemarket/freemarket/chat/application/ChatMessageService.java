package com.freemarket.freemarket.chat.application;

import com.freemarket.freemarket.chat.api.dto.ChatRequestDto;
import com.freemarket.freemarket.chat.api.dto.ChatResponseDto;
import com.freemarket.freemarket.chat.domain.ChatMessage;
import com.freemarket.freemarket.chat.domain.ChatRoom;
import com.freemarket.freemarket.chat.domain.ChatRoomStatus;
import com.freemarket.freemarket.chat.domain.MessageType;
import com.freemarket.freemarket.chat.domain.repository.ChatMessageRepository;
import com.freemarket.freemarket.chat.exception.ChatException;
import com.freemarket.freemarket.user.domain.User;
import com.freemarket.freemarket.user.domain.repository.UserRepository;
import com.freemarket.freemarket.user.exception.UserException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ChatRoomService chatRoomService;

    @Transactional
    public ChatResponseDto.MessageResponse sendMessage(Long chatRoomId, Long senderId, ChatRequestDto.MessageSendRequest request) {
        ChatRoom chatRoom = chatRoomService.getChatRoomWithAccessCheck(chatRoomId, senderId);

        // 채팅방이 활성 상태인지 확인
        if (chatRoom.getStatus() != ChatRoomStatus.ACTIVE) {
            throw new ChatException.ChatRoomInactiveException();
        }

        User sender = getUser(senderId);

        MessageType messageType = request.messageType() != null ? request.messageType() : MessageType.TEXT;

        ChatMessage message = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .content(request.content())
                .messageType(messageType)
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);

        // 채팅방의 마지막 메시지 정보 업데이트
        chatRoom.updateLastMessage(request.content(), LocalDateTime.now());

        log.info("메시지 전송 완료: 채팅방 ID {}, 발신자 ID {}", chatRoomId, senderId);

        return ChatResponseDto.MessageResponse.from(savedMessage);
    }

    public ChatResponseDto.MessageListResponse getChatMessages(Long chatRoomId, Long userId, Pageable pageable) {
        ChatRoom chatRoom = chatRoomService.getChatRoomWithAccessCheck(chatRoomId, userId);

        Page<ChatMessage> messagesPage = chatMessageRepository.findByChatRoomOrderByCreatedDateDesc(chatRoom, pageable);

        return ChatResponseDto.MessageListResponse.builder()
                .messages(messagesPage.getContent().stream()
                        .map(ChatResponseDto.MessageResponse::from)
                        .toList())
                .hasNext(messagesPage.hasNext())
                .totalCount(messagesPage.getTotalElements())
                .build();
    }

    @Transactional
    public void markMessagesAsRead(Long chatRoomId, Long userId) {
        chatRoomService.getChatRoomWithAccessCheck(chatRoomId, userId);

        int updatedCount = chatMessageRepository.markMessagesAsRead(chatRoomId, userId);
        log.info("메시지 읽음 처리 완료: 채팅방 ID {}, 사용자 ID {}, 처리된 메시지 수 {}",
                chatRoomId, userId, updatedCount);
    }

    public long getUnreadMessageCount(Long chatRoomId, Long userId) {
        chatRoomService.getChatRoomWithAccessCheck(chatRoomId, userId);
        return chatMessageRepository.countUnreadMessages(chatRoomId, userId);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserException.UserNotFoundException(userId));
    }
}
