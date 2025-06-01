package com.freemarket.freemarket.chat.application;

import com.freemarket.freemarket.chat.api.dto.ChatRequestDto;
import com.freemarket.freemarket.chat.api.dto.ChatResponseDto;
import com.freemarket.freemarket.chat.domain.ChatRoom;
import com.freemarket.freemarket.chat.domain.ChatRoomStatus;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatResponseDto.ChatRoomResponse createChatRoom(Long userId, ChatRequestDto.ChatRoomCreateRequest request) {
        User buyer = getUser(userId);
        Product product = getProduct(request.productId());
        User seller = product.getSeller();

        // 자신의 상품에 대해 채팅방 생성 불가
        if (seller.getId().equals(userId)) {
            throw new ChatException.SelfChatNotAllowedException();
        }

        // 이미 존재하는 채팅방인지 확인
        chatRoomRepository.findByProductIdAndUserId(request.productId(), userId)
                .ifPresent(room -> {
                    throw new ChatException.ChatRoomAlreadyExistsException();
                });

        ChatRoom chatRoom = ChatRoom.builder()
                .product(product)
                .seller(seller)
                .buyer(buyer)
                .status(ChatRoomStatus.ACTIVE)
                .build();

        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
        log.info("채팅방 생성 완료: 상품 ID {}, 구매자 ID {}", request.productId(), userId);

        return ChatResponseDto.ChatRoomResponse.from(savedChatRoom);
    }

    public ChatResponseDto.ChatRoomResponse getChatRoom(Long chatRoomId, Long userId) {
        ChatRoom chatRoom = getChatRoomWithAccessCheck(chatRoomId, userId);
        return ChatResponseDto.ChatRoomResponse.from(chatRoom);
    }

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

    @Transactional
    public void updateChatRoomStatus(Long chatRoomId, Long userId, ChatRoomStatus status) {
        ChatRoom chatRoom = getChatRoomWithAccessCheck(chatRoomId, userId);
        chatRoom.updateStatus(status);
        log.info("채팅방 상태 변경: 채팅방 ID {}, 새 상태 {}", chatRoomId, status);
    }

    public ChatResponseDto.ChatRoomListResponse getProductChatRooms(Long productId, Long sellerId) {
        // 상품 존재 여부 확인
        Product product = getProduct(productId);

        // 판매자 권한 확인
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new ProductException.ProductAccessDeniedException();
        }

        // 해당 상품의 모든 채팅방 조회
        List<ChatRoom> chatRooms = chatRoomRepository.findByProductId(productId);

        return ChatResponseDto.ChatRoomListResponse.builder()
                .chatRooms(chatRooms.stream()
                        .map(ChatResponseDto.ChatRoomResponse::from)
                        .toList())
                .totalCount(chatRooms.size())
                .build();
    }
    // 채팅방 접근 권한 확인 후 조회
    ChatRoom getChatRoomWithAccessCheck(Long chatRoomId, Long userId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new ChatException.ChatRoomNotFoundException(chatRoomId));

        if (!chatRoom.isParticipant(userId)) {
            throw new ChatException.ChatRoomAccessDeniedException();
        }

        return chatRoom;
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
