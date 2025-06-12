package com.freemarket.freemarket.chat.api;

import com.freemarket.freemarket.chat.api.dto.ChatRequestDto;
import com.freemarket.freemarket.chat.api.dto.ChatResponseDto;
import com.freemarket.freemarket.chat.application.ChatMessageService;
import com.freemarket.freemarket.chat.application.ChatRoomService;
import com.freemarket.freemarket.chat.domain.ChatRoomStatus;
import com.freemarket.freemarket.global.common.ResponseDTO;
import com.freemarket.freemarket.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "채팅", description = "실시간 채팅 관련 API")
public class ChatController {

    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;

    @Operation(summary = "채팅방 생성 또는 조회", 
               description = "상품에 대한 채팅방을 처리합니다.\n" +
                            "- 구매자: 기존 채팅방 조회 또는 새 채팅방 생성\n" +
                            "- 판매자: 해당 상품의 기존 채팅방 조회 (생성 불가)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "채팅방 조회/생성 성공"),  
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "상품 또는 채팅방을 찾을 수 없음")
    })
    @PostMapping("/rooms")
    public ResponseEntity<ResponseDTO<ChatResponseDto.ChatRoomResponse>> createOrGetChatRoom(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "채팅방 생성 정보", required = true)
            @Valid @RequestBody ChatRequestDto.ChatRoomCreateRequest request) {

        log.info("채팅방 생성/조회 요청: 사용자 ID {}, 상품 ID {}", userDetails.getUserId(), request.productId());
        
        ChatResponseDto.ChatRoomResponse response = chatRoomService.createOrGetChatRoom(userDetails.getUserId(), request);
        
        return ResponseEntity.ok(ResponseDTO.success(response, "채팅방 준비 완료"));
    }

    @Operation(summary = "채팅방 조회", description = "특정 채팅방의 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "채팅방 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "채팅방을 찾을 수 없음")
    })
    @GetMapping("/rooms/{chatRoomId}")
    public ResponseEntity<ResponseDTO<ChatResponseDto.ChatRoomResponse>> getChatRoom(
            @Parameter(description = "채팅방 ID", required = true) @PathVariable Long chatRoomId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {

        log.info("채팅방 조회 요청: 채팅방 ID {}, 사용자 ID {}", chatRoomId, userDetails.getUserId());
        ChatResponseDto.ChatRoomResponse response = chatRoomService.getChatRoom(chatRoomId, userDetails.getUserId());

        return ResponseEntity.ok(ResponseDTO.success(response));
    }

    @Operation(summary = "내 채팅방 목록 조회", description = "현재 사용자가 참여한 채팅방 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "채팅방 목록 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/rooms")
    public ResponseEntity<ResponseDTO<ChatResponseDto.ChatRoomListResponse>> getMyChatRooms(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "페이지네이션 정보")
            @PageableDefault(size = 20) Pageable pageable) {

        log.info("내 채팅방 목록 조회 요청: 사용자 ID {}", userDetails.getUserId());
        ChatResponseDto.ChatRoomListResponse response = chatRoomService.getUserChatRooms(userDetails.getUserId(), pageable);

        return ResponseEntity.ok(ResponseDTO.success(response));
    }

    @Operation(summary = "채팅방 메시지 목록 조회", description = "특정 채팅방의 메시지 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "메시지 목록 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "채팅방을 찾을 수 없음")
    })
    @GetMapping("/rooms/{chatRoomId}/messages")
    public ResponseEntity<ResponseDTO<ChatResponseDto.MessageListResponse>> getChatMessages(
            @Parameter(description = "채팅방 ID", required = true) @PathVariable Long chatRoomId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "페이지네이션 정보")
            @PageableDefault(size = 20) Pageable pageable) {

        log.info("채팅 메시지 목록 조회 요청: 채팅방 ID {}, 사용자 ID {}", chatRoomId, userDetails.getUserId());
        ChatResponseDto.MessageListResponse response = chatMessageService.getChatMessages(chatRoomId, userDetails.getUserId(), pageable);

        return ResponseEntity.ok(ResponseDTO.success(response));
    }

    @Operation(summary = "메시지 읽음 처리", description = "채팅방의 읽지 않은 메시지들을 읽음 처리합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "읽음 처리 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "채팅방을 찾을 수 없음")
    })
    @PostMapping("/rooms/{chatRoomId}/read")
    public ResponseEntity<ResponseDTO<Void>> markMessagesAsRead(
            @Parameter(description = "채팅방 ID", required = true) @PathVariable Long chatRoomId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {

        log.info("메시지 읽음 처리 요청: 채팅방 ID {}, 사용자 ID {}", chatRoomId, userDetails.getUserId());
        chatMessageService.markMessagesAsRead(chatRoomId, userDetails.getUserId());

        return ResponseEntity.ok(ResponseDTO.success(null, "메시지가 읽음 처리되었습니다."));
    }

    @Operation(summary = "읽지 않은 메시지 개수 조회", description = "특정 채팅방의 읽지 않은 메시지 개수를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "채팅방을 찾을 수 없음")
    })
    @GetMapping("/rooms/{chatRoomId}/unread-count")
    public ResponseEntity<ResponseDTO<Long>> getUnreadMessageCount(
            @Parameter(description = "채팅방 ID", required = true) @PathVariable Long chatRoomId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {

        log.info("읽지 않은 메시지 개수 조회 요청: 채팅방 ID {}, 사용자 ID {}", chatRoomId, userDetails.getUserId());
        long unreadCount = chatMessageService.getUnreadMessageCount(chatRoomId, userDetails.getUserId());

        return ResponseEntity.ok(ResponseDTO.success(unreadCount));
    }

    @Operation(summary = "채팅방 상태 변경", description = "채팅방의 상태를 변경합니다. (활성화/비활성화)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "상태 변경 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "채팅방을 찾을 수 없음")
    })
    @PatchMapping("/rooms/{chatRoomId}/status")
    public ResponseEntity<ResponseDTO<Void>> updateChatRoomStatus(
            @Parameter(description = "채팅방 ID", required = true) @PathVariable Long chatRoomId,
            @Parameter(description = "변경할 상태", required = true) @RequestParam ChatRoomStatus status,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {

        log.info("채팅방 상태 변경 요청: 채팅방 ID {}, 사용자 ID {}, 새 상태 {}",
                chatRoomId, userDetails.getUserId(), status);
        chatRoomService.updateChatRoomStatus(chatRoomId, userDetails.getUserId(), status);

        return ResponseEntity.ok(ResponseDTO.success(null, "채팅방 상태가 변경되었습니다."));
    }

    @Operation(summary = "상품별 채팅방 목록 조회", description = "특정 상품에 대한 모든 채팅방 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "채팅방 목록 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "상품을 찾을 수 없음")
    })
    @GetMapping("/products/{productId}/chat-rooms")
    public ResponseEntity<ResponseDTO<ChatResponseDto.ChatRoomListResponse>> getProductChatRooms(
            @Parameter(description = "상품 ID", required = true) @PathVariable Long productId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {

        log.info("상품별 채팅방 목록 조회 요청: 상품 ID {}, 사용자 ID {}", productId, userDetails.getUserId());
        ChatResponseDto.ChatRoomListResponse response = chatRoomService.getProductChatRooms(productId, userDetails.getUserId());

        return ResponseEntity.ok(ResponseDTO.success(response, "상품 채팅방 목록을 성공적으로 조회했습니다."));
    }

    @Operation(summary = "판매자 상품별 채팅방 요약 조회", 
               description = "판매자가 자신의 특정 상품에 대한 모든 채팅방과 읽지 않은 메시지 수를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "채팅방 요약 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "상품을 찾을 수 없음")
    })
    @GetMapping("/products/{productId}/chat-summary")
    public ResponseEntity<ResponseDTO<ChatResponseDto.ProductChatSummaryResponse>> getProductChatSummary(
            @Parameter(description = "상품 ID", required = true) @PathVariable Long productId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {

        log.info("상품별 채팅 요약 조회 요청: 상품 ID {}, 사용자 ID {}", productId, userDetails.getUserId());
        ChatResponseDto.ProductChatSummaryResponse response = chatRoomService.getProductChatSummary(productId, userDetails.getUserId());

        return ResponseEntity.ok(ResponseDTO.success(response, "상품 채팅 요약을 성공적으로 조회했습니다."));
    }
}
