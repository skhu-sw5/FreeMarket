package com.freemarket.freemarket.chat.domain.repository;

import com.freemarket.freemarket.chat.domain.ChatMessage;
import com.freemarket.freemarket.chat.domain.ChatRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 채팅방의 메시지 목록 조회 (시간순 역순)
    Page<ChatMessage> findByChatRoomOrderByCreatedDateDesc(ChatRoom chatRoom, Pageable pageable);

    // 채팅방의 읽지 않은 메시지 개수 조회
    @Query("SELECT COUNT(cm) FROM ChatMessage cm " +
            "WHERE cm.chatRoom.id = :chatRoomId " +
            "AND cm.sender.id != :userId " +
            "AND cm.isRead = false")
    long countUnreadMessages(@Param("chatRoomId") Long chatRoomId, @Param("userId") Long userId);

    // 메시지 읽음 처리 (특정 사용자가 받은 메시지들)
    @Modifying
    @Query("UPDATE ChatMessage cm SET cm.isRead = true " +
            "WHERE cm.chatRoom.id = :chatRoomId " +
            "AND cm.sender.id != :userId " +
            "AND cm.isRead = false")
    int markMessagesAsRead(@Param("chatRoomId") Long chatRoomId, @Param("userId") Long userId);
}
