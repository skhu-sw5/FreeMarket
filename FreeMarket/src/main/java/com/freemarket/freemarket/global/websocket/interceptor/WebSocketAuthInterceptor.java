package com.freemarket.freemarket.global.websocket.interceptor;

import com.freemarket.freemarket.global.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtProvider jwtProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null) {
            log.debug("WebSocket 메시지 처리 - Command: {}, User: {}",
                    accessor.getCommand(), accessor.getUser());

            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String token = accessor.getFirstNativeHeader("Authorization");

                log.info("WebSocket CONNECT 시도 - Authorization 헤더: {}",
                        token != null ? token.substring(0, Math.min(20, token.length())) + "..." : "없음");

                if (StringUtils.hasText(token) && token.startsWith("Bearer ")) {
                    token = token.substring(7);

                    if (jwtProvider.validateToken(token)) {
                        Authentication authentication = jwtProvider.getAuthentication(token);
                        accessor.setUser(authentication);
                        log.info("WebSocket 인증 성공: 사용자={}, ID={}",
                                authentication.getName(),
                                authentication.getPrincipal());
                    } else {
                        log.warn("유효하지 않은 WebSocket JWT 토큰");
                        throw new IllegalArgumentException("유효하지 않은 JWT 토큰입니다.");
                    }
                } else {
                    log.warn("WebSocket Authorization 헤더 형식 오류: {}", token);
                    throw new IllegalArgumentException("Authorization 헤더 형식이 올바르지 않습니다.");
                }
            }

            // SEND, SUBSCRIBE 등의 다른 명령어에서도 사용자 정보 전파
            if (StompCommand.SEND.equals(accessor.getCommand()) ||
                    StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {

                if (accessor.getUser() == null) {
                    log.warn("WebSocket {} 명령에서 사용자 정보 없음", accessor.getCommand());
                }
            }
        }

        return message;
    }
}
