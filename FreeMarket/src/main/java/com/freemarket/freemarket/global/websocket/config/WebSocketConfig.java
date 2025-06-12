package com.freemarket.freemarket.global.websocket.config;

import com.freemarket.freemarket.global.websocket.interceptor.WebSocketAuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 클라이언트에게 메시지를 전달할 때 사용할 prefix
        config.enableSimpleBroker("/topic", "/queue");

        // 클라이언트에서 서버로 메시지를 보낼 때 사용할 prefix
        config.setApplicationDestinationPrefixes("/app");

        // 사용자별 개인 메시지 전송을 위한 prefix
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket 연결 엔드포인트 - 채팅용
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns("http://localhost:8081", "http://127.0.0.1:8081", "https://freemarket.duckdns.org,", "http://localhost:8080")
                .withSockJS()
                .setSessionCookieNeeded(false); // CORS 문제 방지

        // 일반 WebSocket 엔드포인트 (SockJS 없이)
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns("http://localhost:8081", "http://127.0.0.1:8081", "https://freemarket.duckdns.org", "http://localhost:8080");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // WebSocket 인증 인터셉터 등록
        registration.interceptors(webSocketAuthInterceptor);
    }
}
