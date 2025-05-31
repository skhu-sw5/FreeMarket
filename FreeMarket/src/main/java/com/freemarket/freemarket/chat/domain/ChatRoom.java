package com.freemarket.freemarket.chat.domain;

import com.freemarket.freemarket.global.auditing.BaseTimeEntity;
import com.freemarket.freemarket.product.domain.Product;
import com.freemarket.freemarket.user.domain.User;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_rooms", uniqueConstraints = @UniqueConstraint(columnNames =  {"product_id", "buyer_id"}))
@Getter
@NoArgsConstructor
public class ChatRoom extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_room_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatRoomStatus status = ChatRoomStatus.ACTIVE;

    @Column(name = "last_message")
    private String lastMessage;

    @Column(length = 500)
    private LocalDateTime lastMessageTime;

    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages = new ArrayList<>();

    @Builder
    public ChatRoom(Product product, User seller, User buyer, ChatRoomStatus status) {
        this.product = product;
        this.seller = seller;
        this.buyer = buyer;
        this.status = ChatRoomStatus.ACTIVE;
    }

    public void updateLastMessage(String content, LocalDateTime messageTime) {
        this.lastMessage = content;
        this.lastMessageTime = messageTime;
    }

    public void changeStatus(ChatRoomStatus status) {
        this.status = status;
    }

    public boolean isActive() {
        return this.status == ChatRoomStatus.ACTIVE;
    }

    // 사용자가 채팅방 참여자인지 확인
    public boolean isParticipant(Long userId) {
        return seller.getId().equals(userId) || buyer.getId().equals(userId);
    }

    // 상대방 정보 조회
    public User getOtherParticipant(Long userId) {
        if (seller.getId().equals(userId)) {
            return buyer;
        } else if (buyer.getId().equals(userId)) {
            return seller;
        }
        throw new IllegalArgumentException("사용자가 채팅방 참여자가 아닙니다.");
    }

    public void updateStatus(ChatRoomStatus status) {
        this.status = status;
    }
}
