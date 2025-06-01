package com.freemarket.freemarket.product.application;

import com.freemarket.freemarket.chat.api.dto.ChatResponseDto;
import com.freemarket.freemarket.chat.domain.ChatMessage;
import com.freemarket.freemarket.chat.domain.ChatRoom;
import com.freemarket.freemarket.chat.domain.MessageType;
import com.freemarket.freemarket.chat.domain.repository.ChatMessageRepository;
import com.freemarket.freemarket.chat.domain.repository.ChatRoomRepository;
import com.freemarket.freemarket.chat.exception.ChatException;
import com.freemarket.freemarket.product.api.dto.ProductDto;
import com.freemarket.freemarket.product.domain.Product;
import com.freemarket.freemarket.product.domain.ProductStatus;
import com.freemarket.freemarket.product.exception.ProductException;
import com.freemarket.freemarket.review.domain.repository.ReviewRepository;
import com.freemarket.freemarket.user.domain.User;
import com.freemarket.freemarket.user.domain.repository.UserRepository;
import com.freemarket.freemarket.user.exception.UserException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProductStatusService {

    private final ProductManagementService productManagementService;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    // 판매 완료 처리
    @Transactional
    public ProductDto.ProductResponse markProductAsSold(Long sellerId, Long productId, Long buyerId, Long chatRoomId) {
        Product product = productManagementService.getProductWithSellerCheck(productId, sellerId);

        if (product.getStatus() == ProductStatus.SOLD_OUT) {
            throw new ProductException.AlreadySoldProductException();
        }

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new UserException.UserNotFoundException(buyerId));

        // 채팅방 확인
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId).orElseThrow(
                () -> new ChatException.ChatRoomNotFoundException(chatRoomId));

        // 채팅방 참가자 확인 (판매자와 구매자가 맞는지)
        if (!chatRoom.getSeller().getId().equals(sellerId) || !chatRoom.getBuyer().getId().equals(buyerId)) {
            throw new ChatException.ChatRoomAccessDeniedException();
        }

        // 채팅방의 상품이 판매하려는 상품과 일치하는지 확인
        if (!chatRoom.getProduct().getId().equals(productId)) {
            throw new ProductException.ProductMismatchException();
        }

        // 상품 판매완료 처리
        product.markAsSold(buyer);

        // 채팅방에 시스템 메시지 전송
        sendSaleCompletionMessage(chatRoom, buyer);

        log.info("상품 판매완료 처리: 상품 ID {}, 판매자 ID {}, 구매자 ID {}, 채팅방 ID {}",
                productId, sellerId, buyerId, chatRoomId);

        return ProductDto.ProductResponse.from(product);
    }

    // 판매완료 취소 처리 메서드
    @Transactional
    public ProductDto.ProductResponse cancelProductSold(Long sellerId, Long productId) {
        Product product = productManagementService.getProductWithSellerCheck(productId, sellerId);

        if (product.getStatus() != ProductStatus.SOLD_OUT) {
            throw new ProductException.NotSoldProductException();
        }

        // 구매자 정보 백업 (취소 후에는 null이 되기 때문)
        User buyer = product.getBuyer();
        if (buyer == null) {
            throw new ProductException.BuyerNotFoundException();
        }

        // 리뷰가 작성되었는지 확인
        boolean reviewExists = reviewRepository.findByProduct(product).isPresent();
        if (reviewExists) {
            throw new ProductException.CannotCancelSoldProductException("이미 리뷰가 작성된 상품은 판매완료 취소가 불가능합니다.");
        }

        // 판매완료 취소 처리
        product.cancelSold();

        // 이 상품에 대한 채팅방 중 구매자와의 채팅방 찾기
        List<ChatRoom> chatRooms = chatRoomRepository.findByProductId(productId);
        chatRooms.stream()
                .filter(chatRoom -> chatRoom.getBuyer().getId().equals(buyer.getId()))
                .findFirst()
                .ifPresent(chatRoom -> {
                    // 취소 알림 메시지 전송
                    sendSaleCancellationMessage(chatRoom, product);
                });

        log.info("판매완료 취소 처리: 상품 ID {}, 판매자 ID {}", productId, sellerId);
        return ProductDto.ProductResponse.from(product);
    }

    // 판매 완료 시스템 메시지 전송
    private void sendSaleCompletionMessage(ChatRoom chatRoom, User buyer) {
        try {
            // 시스템 메시지 생성
            String content = String.format("거래가 완료되었습니다. 구매자: %s", buyer.getName());

            // 채팅 메시지 저장
            ChatMessage systemMessage = ChatMessage.builder()
                    .chatRoom(chatRoom)
                    .sender(chatRoom.getSeller())
                    .content(content)
                    .messageType(MessageType.TEXT)
                    .build();

            chatMessageRepository.save(systemMessage);

            // 채팅방 마지막 메시지 업데이트
            chatRoom.updateLastMessage(content, LocalDateTime.now());

            // WebSocket으로 메시지 전송
            simpMessagingTemplate.convertAndSend(
                    "/topic/chat/" + chatRoom.getId(),
                    ChatResponseDto.MessageResponse.from(systemMessage)
            );
            log.info("판매 완료 시스템 메시지 전송 성공: 채팅방 ID {}", chatRoom.getId());
        } catch (Exception e) {
            log.error("판매 완료 시스템 메시지 전송 실패: 채팅방 ID {}, 오류: {}",
                    chatRoom.getId(), e.getMessage());
        }
    }

    // 판매 취소 시스템 메시지 전송
    private void sendSaleCancellationMessage(ChatRoom chatRoom, Product product) {
        try {
            // 시스템 메시지 생성
            String content = String.format("판매자가 거래를 취소했습니다. 상품: %s", product.getName());

            // 채팅 메시지 저장
            ChatMessage systemMessage = ChatMessage.builder()
                    .chatRoom(chatRoom)
                    .sender(chatRoom.getSeller()) // 판매자를 발신자로 설정
                    .content(content)
                    .messageType(MessageType.SYSTEM)
                    .build();

            chatMessageRepository.save(systemMessage);

            // 채팅방 마지막 메시지 업데이트
            chatRoom.updateLastMessage(content, LocalDateTime.now());

            // WebSocket으로 메시지 전송 (실시간 알림)
            simpMessagingTemplate.convertAndSend(
                    "/topic/chat/" + chatRoom.getId(),
                    ChatResponseDto.MessageResponse.from(systemMessage)
            );

            log.info("판매 취소 시스템 메시지 전송 성공: 채팅방 ID {}", chatRoom.getId());
        } catch (Exception e) {
            log.error("판매 취소 시스템 메시지 전송 실패: 채팅방 ID {}, 오류: {}",
                    chatRoom.getId(), e.getMessage());
            // 실패해도 판매 취소 처리는 진행
        }
    }
}
