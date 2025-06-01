package com.freemarket.freemarket.chat.domain.repository;

import com.freemarket.freemarket.chat.domain.ChatRoom;
import com.freemarket.freemarket.chat.domain.ChatRoomStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    // 상품과 사용자 기준으로 채팅방 조회
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.product.id = :productId " +
            "AND ((cr.seller.id = :userId) OR (cr.buyer.id = :userId))")
    Optional<ChatRoom> findByProductIdAndUserId(@Param("productId") Long productId,
                                                @Param("userId") Long userId);

    // 사용자가 참여한 채팅방 목록 조회
    @Query("SELECT cr FROM ChatRoom cr " +
            "WHERE (cr.seller.id = :userId OR cr.buyer.id = :userId) " +
            "AND cr.status = :status " +
            "ORDER BY cr.lastMessageTime DESC, cr.createdDate DESC")
    Page<ChatRoom> findByUserIdAndStatus(@Param("userId") Long userId,
                                         @Param("status") ChatRoomStatus status,
                                         Pageable pageable);

    // 사용자가 참여한 모든 채팅방 목록 조회
    @Query("SELECT cr FROM ChatRoom cr " +
            "WHERE (cr.seller.id = :userId OR cr.buyer.id = :userId) " +
            "ORDER BY cr.lastMessageTime DESC, cr.createdDate DESC")
    Page<ChatRoom> findByUserId(@Param("userId") Long userId, Pageable pageable);

    // 상품별 채팅방 개수 조회
    long countByProductId(Long productId);

    List<ChatRoom> findByProductId(Long productId);
}
