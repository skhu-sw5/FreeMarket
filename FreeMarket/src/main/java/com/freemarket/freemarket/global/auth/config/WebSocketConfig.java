package com.freemarket.freemarket.global.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // 메시지 브로커를 통해 WebSocket 메시지 처리를 활성화
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 클라이언트가 "/topic" 또는 "/queue"로 시작하는 목적지로 메시지를 구독할 수 있게 한다.
        config.enableSimpleBroker("/topic", "queue");
        // 애플리케이션 목적지 접두사를 설정, 서버로 향하는 메시지는 이 접두사로 시작해야 한다.
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 클라이언트가 연결한 WebSocket 엔드포인트 등록
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:8081", "http://127.0.0.1:8081", "https://freemarket.duckdns.org")
                .withSockJS();
    }
}
