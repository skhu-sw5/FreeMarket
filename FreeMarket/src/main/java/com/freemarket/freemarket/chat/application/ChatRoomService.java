package com.freemarket.freemarket.chat.application;

import com.freemarket.freemarket.chat.api.dto.ChatRequestDto;
import com.freemarket.freemarket.chat.api.dto.ChatResponseDto;
import com.freemarket.freemarket.chat.domain.ChatRoom;
import com.freemarket.freemarket.chat.domain.ChatRoomStatus;
import com.freemarket.freemarket.chat.domain.repository.ChatMessageRepository;
import com.freemarket.freemarket.chat.domain.repository.ChatRoomRepository;
import com.freemarket.freemarket.chat.exception.ChatException;
import com.freemarket.freemarket.product.domain.Product;
import com.freemarket.freemarket.product.domain.repository.ProductRepository;
import com.freemarket.freemarket.product.exception.ProductException;
import com.freemarket.freemarket.user.domain.User;
import com.freemarket.freemarket.user.domain.repository.UserRepository;
import com.freemarket.freemarket.user.exception.UserException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;  // ChatMessageService 대신 직접 Repository 사용
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 채팅방 생성 또는 기존 채팅방 반환
     * - 구매자만 채팅방을 생성할 수 있음
     * - 이미 존재하는 채팅방이 있으면 기존 채팅방 반환
     * - 자신의 상품에 대해서는 채팅방 생성 불가
     */
    @Transactional
    public ChatResponseDto.ChatRoomResponse createOrGetChatRoom(Long userId, ChatRequestDto.ChatRoomCreateRequest request) {
        User buyer = getUser(userId);
        Product product = getProduct(request.productId());
        User seller = product.getSeller();

        // 자신의 상품에 대해 채팅방 생성 불가
        if (seller.getId().equals(userId)) {
            throw new ChatException.SelfChatNotAllowedException();
        }

        // 기존 채팅방 확인
        Optional<ChatRoom> existingChatRoom = chatRoomRepository.findByProductIdAndUserId(request.productId(), userId);
        
        if (existingChatRoom.isPresent()) {
            ChatRoom chatRoom = existingChatRoom.get();
            
            // 비활성화된 채팅방이면 다시 활성화
            if (chatRoom.getStatus() != ChatRoomStatus.ACTIVE) {
                chatRoom.changeStatus(ChatRoomStatus.ACTIVE);
                log.info("기존 채팅방 재활성화: 채팅방 ID {}", chatRoom.getId());
            }
            
            log.info("기존 채팅방 반환: 상품 ID {}, 구매자 ID {}, 채팅방 ID {}", 
                    request.productId(), userId, chatRoom.getId());
            return ChatResponseDto.ChatRoomResponse.from(chatRoom);
        }

        // 새 채팅방 생성
        ChatRoom chatRoom = ChatRoom.builder()
                .product(product)
                .seller(seller)
                .buyer(buyer)
                .status(ChatRoomStatus.ACTIVE)
                .build();

        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
        
        // 판매자에게 새 채팅방 알림 전송
        sendNewChatRoomNotification(seller, savedChatRoom);
        
        log.info("새 채팅방 생성 완료: 상품 ID {}, 구매자 ID {}, 채팅방 ID {}", 
                request.productId(), userId, savedChatRoom.getId());

        return ChatResponseDto.ChatRoomResponse.from(savedChatRoom);
    }

    public ChatResponseDto.ChatRoomResponse getChatRoom(Long chatRoomId, Long userId) {
        ChatRoom chatRoom = getChatRoomWithAccessCheck(chatRoomId, userId);
        return ChatResponseDto.ChatRoomResponse.from(chatRoom);
    }

     // 사용자의 채팅방 목록 조회 (구매자, 판매자 모두)
    public ChatResponseDto.ChatRoomListResponse getUserChatRooms(Long userId, Pageable pageable) {
        Page<ChatRoom> chatRoomsPage = chatRoomRepository.findByUserIdAndStatus(
                userId, ChatRoomStatus.ACTIVE, pageable);

        return ChatResponseDto.ChatRoomListResponse.builder()
                .chatRooms(chatRoomsPage.getContent().stream()
                        .map(ChatResponseDto.ChatRoomResponse::from)
                        .toList())
                .totalCount((int) chatRoomsPage.getTotalElements())
                .build();
    }

    // 모든 채팅방 목록 조회 (상태 무관)
    public ChatResponseDto.ChatRoomListResponse getAllUserChatRooms(Long userId, Pageable pageable) {
        Page<ChatRoom> chatRoomsPage = chatRoomRepository.findByUserId(userId, pageable);

        return ChatResponseDto.ChatRoomListResponse.builder()
                .chatRooms(chatRoomsPage.getContent().stream()
                        .map(ChatResponseDto.ChatRoomResponse::from)
                        .toList())
                .totalCount((int) chatRoomsPage.getTotalElements())
                .build();
    }

    @Transactional
    public void updateChatRoomStatus(Long chatRoomId, Long userId, ChatRoomStatus status) {
        ChatRoom chatRoom = getChatRoomWithAccessCheck(chatRoomId, userId);
        chatRoom.updateStatus(status);
        log.info("채팅방 상태 변경: 채팅방 ID {}, 사용자 ID {}, 새 상태 {}", 
                chatRoomId, userId, status);
    }

    // 상품별 채팅방 목록 조회 (판매자 전용)
    public ChatResponseDto.ChatRoomListResponse getProductChatRooms(Long productId, Long sellerId) {
        Product product = getProduct(productId);

        // 판매자 권한 확인
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new ProductException.ProductAccessDeniedException();
        }

        List<ChatRoom> chatRooms = chatRoomRepository.findByProductId(productId);

        return ChatResponseDto.ChatRoomListResponse.builder()
                .chatRooms(chatRooms.stream()
                        .map(ChatResponseDto.ChatRoomResponse::from)
                        .toList())
                .totalCount(chatRooms.size())
                .build();
    }

    // 상품별 채팅 요약 정보 조회 (판매자 전용)
    public ChatResponseDto.ProductChatSummaryResponse getProductChatSummary(Long productId, Long sellerId) {
        Product product = getProduct(productId);

        // 판매자 권한 확인
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new ProductException.ProductAccessDeniedException();
        }

        List<ChatRoom> chatRooms = chatRoomRepository.findByProductId(productId);

        List<ChatResponseDto.ChatRoomSummary> chatRoomSummaries = chatRooms.stream()
                .map(chatRoom -> {
                    // 각 채팅방의 읽지 않은 메시지 수 조회 (Repository 직접 사용)
                    long unreadCount = chatMessageRepository.countUnreadMessages(chatRoom.getId(), sellerId);
                    
                    return ChatResponseDto.ChatRoomSummary.builder()
                            .chatRoomId(chatRoom.getId())
                            .buyerName(chatRoom.getBuyer().getName())
                            .lastMessage(chatRoom.getLastMessage())
                            .lastMessageTime(chatRoom.getLastMessageTime())
                            .unreadCount(unreadCount)
                            .build();
                })
                .toList();

        // 통계 계산
        int totalChatRooms = chatRooms.size();
        int unreadChatRooms = (int) chatRoomSummaries.stream()
                .filter(summary -> summary.unreadCount() > 0)
                .count();
        long totalUnreadMessages = chatRoomSummaries.stream()
                .mapToLong(ChatResponseDto.ChatRoomSummary::unreadCount)
                .sum();

        return ChatResponseDto.ProductChatSummaryResponse.builder()
                .productId(productId)
                .productName(product.getName())
                .totalChatRooms(totalChatRooms)
                .unreadChatRooms(unreadChatRooms)
                .totalUnreadMessages(totalUnreadMessages)
                .chatRooms(chatRoomSummaries)
                .build();
    }

    // 채팅방 접근 권한 확인 후 조회
    public ChatRoom getChatRoomWithAccessCheck(Long chatRoomId, Long userId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new ChatException.ChatRoomNotFoundException(chatRoomId));

        if (!chatRoom.isParticipant(userId)) {
            throw new ChatException.ChatRoomAccessDeniedException();
        }

        return chatRoom;
    }

    // 판매자에게 새 채팅방 생성 알림
    private void sendNewChatRoomNotification(User seller, ChatRoom chatRoom) {
        try {
            // 판매자 개인 알림 전송
            ChatResponseDto.ChatNotificationDto notification = ChatResponseDto.ChatNotificationDto.builder()
                    .type("NEW_CHAT_ROOM")
                    .chatRoomId(chatRoom.getId())
                    .productName(chatRoom.getProduct().getName())
                    .buyerName(chatRoom.getBuyer().getName())
                    .message(chatRoom.getBuyer().getName() + "님이 '" + 
                           chatRoom.getProduct().getName() + "' 상품에 관심을 보이며 채팅을 시작했습니다.")
                    .build();

            messagingTemplate.convertAndSendToUser(
                    seller.getId().toString(),
                    "/queue/notifications",
                    notification
            );
            
            log.info("판매자 알림 전송 완료: 판매자 ID {}, 채팅방 ID {}", 
                    seller.getId(), chatRoom.getId());
        } catch (Exception e) {
            log.error("판매자 알림 전송 실패: 판매자 ID {}, 채팅방 ID {}, 오류: {}", 
                    seller.getId(), chatRoom.getId(), e.getMessage());
        }
    }

    private Product getProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ProductException.ProductNotFoundException(productId));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserException.UserNotFoundException(userId));
    }
}
