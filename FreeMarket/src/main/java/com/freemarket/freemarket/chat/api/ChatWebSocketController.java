package com.freemarket.freemarket.chat.api;

import com.freemarket.freemarket.chat.api.dto.ChatRequestDto;
import com.freemarket.freemarket.chat.api.dto.ChatResponseDto;
import com.freemarket.freemarket.chat.application.ChatMessageService;
import com.freemarket.freemarket.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{chatRoomId}/send")
    public void sendMessage(
            @DestinationVariable Long chatRoomId,
            @Payload ChatRequestDto.MessageSendRequest request,
            Principal principal) {

        log.info("WebSocket 메시지 전송 요청 - 채팅방 ID: {}, Principal: {}",
                chatRoomId, principal != null ? principal.getName() : "null");

        try {
            if (principal == null) {
                log.error("인증되지 않은 사용자의 메시지 전송 시도");
                messagingTemplate.convertAndSend(
                        "/topic/chat/" + chatRoomId + "/error",
                        "인증 오류: 로그인이 필요합니다.");
                return;
            }

            // Principal에서 Authentication 추출
            Authentication authentication = (Authentication) principal;
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            log.info("인증된 사용자: ID={}, Email={}",
                    userDetails.getUserId(), userDetails.getUsername());

            // 메시지 저장
            ChatResponseDto.MessageResponse response = chatMessageService.sendMessage(
                    chatRoomId, userDetails.getUserId(), request);

            // 채팅방 참여자에게 메시지 전송
            messagingTemplate.convertAndSend(
                    "/topic/chat/" + chatRoomId, response);

            log.info("WebSocket 메시지 전송 완료: 채팅방 ID {}, 발신자 ID {}",
                    chatRoomId, userDetails.getUserId());

        } catch (Exception e) {
            log.error("WebSocket 메시지 전송 실패: 채팅방 ID {}, 오류: {}",
                    chatRoomId, e.getMessage());

            // 채팅방 전체에 에러 알림
            messagingTemplate.convertAndSend(
                    "/topic/chat/" + chatRoomId + "/error",
                    "메시지 전송 실패: " + e.getMessage());
        }
    }

    @MessageMapping("/chat/{chatRoomId}/read")
    public void markAsRead(
            @DestinationVariable Long chatRoomId,
            Principal principal) {

        log.info("WebSocket 읽음 처리 요청 - 채팅방 ID: {}, Principal: {}",
                chatRoomId, principal != null ? principal.getName() : "null");

        try {
            if (principal == null) {
                log.error("인증되지 않은 사용자의 읽음 처리 시도");
                return;
            }

            // Principal에서 Authentication 추출
            Authentication authentication = (Authentication) principal;
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            chatMessageService.markMessagesAsRead(chatRoomId, userDetails.getUserId());

            // 읽음 처리 알림을 채팅방에 전송
            messagingTemplate.convertAndSend(
                    "/topic/chat/" + chatRoomId + "/read",
                    userDetails.getUserId());

            log.info("메시지 읽음 처리 완료: 채팅방 ID {}, 사용자 ID {}",
                    chatRoomId, userDetails.getUserId());

        } catch (Exception e) {
            log.error("메시지 읽음 처리 실패: 채팅방 ID {}, 오류: {}",
                    chatRoomId, e.getMessage());
        }
    }
}
