<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <main class="py-6">
      <div class="container mx-auto px-4">
        <!-- 네비게이션 브레드크럼 -->
        <nav class="mb-6 flex items-center text-sm text-gray-600">
          <router-link to="/" class="text-blue-600 hover:text-blue-800">홈</router-link>
          <i class="fas fa-chevron-right mx-2 text-gray-400 text-xs"></i>
          <router-link to="/products" class="text-blue-600 hover:text-blue-800">상품</router-link>
          <i v-if="chatRoom && chatRoom.productId" class="fas fa-chevron-right mx-2 text-gray-400 text-xs"></i>
          <router-link 
            v-if="chatRoom && chatRoom.productId" 
            :to="`/products/${chatRoom.productId}`" 
            class="text-blue-600 hover:text-blue-800"
          >
            {{ truncate(chatRoom.productName, 20) }}
          </router-link>
          <i class="fas fa-chevron-right mx-2 text-gray-400 text-xs"></i>
          <span class="text-gray-500">채팅</span>
        </nav>
        
        <!-- 로딩 상태 -->
        <div v-if="loading" class="bg-white rounded-lg shadow-sm p-6 min-h-[600px] flex items-center justify-center">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            <p class="text-gray-600">채팅방을 불러오는 중입니다...</p>
          </div>
        </div>
        
        <!-- 에러 상태 -->
        <div v-else-if="error" class="bg-white rounded-lg shadow-sm p-6 min-h-[600px] flex items-center justify-center">
          <div class="text-center max-w-lg">
            <i class="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
            <h2 class="text-xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h2>
            <p class="text-gray-600 mb-6">{{ error }}</p>
            <button 
              @click="reloadPage" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <i class="fas fa-sync-alt mr-2"></i>
              다시 시도하기
            </button>
          </div>
        </div>
        
        <!-- 채팅방 콘텐츠 -->
        <div v-else-if="chatRoom" class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- 채팅방 정보 & 제품 정보 (데스크톱에서 왼쪽 사이드바) -->
          <div class="md:col-span-1 space-y-6">
            <!-- 제품 정보 카드 -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
              <div class="p-4">
                <h2 class="text-lg font-bold text-gray-900 mb-4">상품 정보</h2>
                <div 
                  class="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4"
                  @click="goToProduct"
                >
                  <img 
                    v-if="chatRoom.productThumbnailUrl" 
                    :src="apiUrl + chatRoom.productThumbnailUrl" 
                    alt="상품 이미지" 
                    class="w-full h-full object-cover cursor-pointer"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
                    <i class="fas fa-image text-gray-400 text-3xl"></i>
                  </div>
                </div>
                
                <h3 
                  class="font-medium text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                  @click="goToProduct"
                >
                  {{ chatRoom.productName }}
                </h3>
                
                <div class="flex justify-between">
                  <p class="text-sm text-gray-600">판매자: {{ chatRoom.sellerName }}</p>
                  <p class="text-sm text-gray-600">구매자: {{ chatRoom.buyerName }}</p>
                </div>
                
                <div class="mt-4">
                  <button 
                    @click="goToProduct"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <i class="fas fa-external-link-alt mr-2"></i>
                    상품 상세 보기
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 대화 상대 정보 -->
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
              <div class="p-4">
                <h2 class="text-lg font-bold text-gray-900 mb-4">대화 상대</h2>
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <i class="fas fa-user text-gray-500"></i>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">
                      {{ isSeller ? chatRoom.buyerName : chatRoom.sellerName }}
                    </p>
                    <p class="text-sm text-gray-600">
                      {{ isSeller ? '구매자' : '판매자' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 채팅방 상태 및 관리 (판매자용) -->
            <div v-if="isSeller" class="bg-white rounded-lg shadow-sm overflow-hidden">
              <div class="p-4">
                <h2 class="text-lg font-bold text-gray-900 mb-4">채팅방 관리</h2>
                
                <div class="space-y-3">
                  <button 
                    v-if="!isProductSold"
                    @click="markAsSold" 
                    class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <i class="fas fa-check-circle mr-2"></i>
                    이 구매자에게 판매하기
                  </button>
                  
                  <button 
                    v-if="isProductSold"
                    class="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium cursor-default"
                    disabled
                  >
                    <i class="fas fa-check-circle mr-2"></i>
                    판매 완료됨
                  </button>
                  
                  <button 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <i class="fas fa-ban mr-2"></i>
                    대화 차단하기
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 채팅 내용 (데스크톱에서 오른쪽 메인 영역) -->
          <div class="md:col-span-3">
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
              <!-- 채팅방 헤더 -->
              <div class="p-4 border-b border-gray-100">
                <div class="flex justify-between items-center">
                  <h1 class="text-xl font-bold text-gray-900">
                    {{ chatRoom.productName }}
                  </h1>
                  <span v-if="isProductSold" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <i class="fas fa-tag mr-1"></i>
                    판매 완료
                  </span>
                </div>
              </div>
              
              <!-- 채팅 메시지 영역 -->
              <div 
                ref="messageContainer" 
                class="p-4 h-96 overflow-y-auto bg-gray-50"
                @scroll="handleScroll"
              >
                <div v-if="messages.length === 0" class="h-full flex items-center justify-center">
                  <div class="text-center text-gray-500">
                    <i class="far fa-comment-dots text-3xl mb-2"></i>
                    <p>아직 메시지가 없습니다. 첫 메시지를 보내보세요!</p>
                  </div>
                </div>
                
                <div v-else class="space-y-4">
                  <div 
                    v-for="(message, index) in messages" 
                    :key="index"
                    :class="[
                      'max-w-[75%] rounded-lg p-3 break-words',
                      message.senderId === currentUserId 
                        ? 'bg-blue-600 text-white ml-auto rounded-br-none' 
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    ]"
                  >
                    <div class="text-sm mb-1" :class="message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-600'">
                      {{ message.senderName }}
                    </div>
                    <div>{{ message.content }}</div>
                    <div class="text-xs mt-1 flex items-center justify-end" 
                         :class="message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'">
                      {{ formatMessageTime(message.sentTime) }}
                      <span v-if="message.senderId === currentUserId" class="ml-1">
                        <i class="fas fa-check-double" :class="message.isRead ? 'text-blue-300' : 'text-blue-200 opacity-50'"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 메시지 입력 영역 -->
              <div class="p-4 border-t border-gray-100">
                <form @submit.prevent="sendMessage" class="flex">
                  <input 
                    v-model="newMessage" 
                    type="text" 
                    placeholder="메시지를 입력하세요..." 
                    class="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :disabled="isProductSold || chatRoom.status !== 'ACTIVE'"
                  />
                  <button 
                    type="submit" 
                    class="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors flex items-center"
                    :disabled="!newMessage.trim() || isProductSold || chatRoom.status !== 'ACTIVE'"
                    :class="{ 'opacity-50 cursor-not-allowed': !newMessage.trim() || isProductSold || chatRoom.status !== 'ACTIVE' }"
                  >
                    <i class="fas fa-paper-plane"></i>
                  </button>
                </form>
                
                <div v-if="isProductSold || chatRoom.status !== 'ACTIVE'" class="mt-2 text-center text-sm text-gray-500">
                  <i class="fas fa-lock mr-1"></i>
                  {{ isProductSold ? '판매 완료된 상품입니다. 새로운 메시지를 보낼 수 없습니다.' : '비활성화된 채팅방입니다.' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import chatService from '@/services/chatService'
import websocketService from '@/services/websocketService'
import { API_BASE_URL } from '@/config'
import { mapState } from 'vuex'

export default {
  components: {
    AppHeader
  },
  
  props: {
    roomId: {
      type: [String, Number],
      required: true
    }
  },
  
  data() {
    return {
      chatRoom: null,
      messages: [],
      newMessage: '',
      loading: true,
      error: null,
      apiUrl: API_BASE_URL || '',
      isAutoScrollEnabled: true,
      isProductSold: false,
      currentUserId: this.$store.state.auth.user ? this.$store.state.auth.user.id : null
    }
  },
  
  computed: {
    ...mapState('auth', ['token', 'user']),
    
    currentRoomId() {
      return this.roomId || this.$route.params.roomId
    },
    
    isSeller() {
      return this.chatRoom && this.user && this.chatRoom.sellerId === this.user.id
    }
  },
  
  async created() {
    console.log('ChatRoom 컴포넌트 생성됨, roomId:', this.roomId)
    console.log('Route params:', this.$route.params)
    this.initialize()
  },
  
  mounted() {
    // 컴포넌트가 마운트될 때 스크롤을 최하단으로 이동
    this.$nextTick(() => {
      this.scrollToBottom()
    })
  },
  
  beforeUnmount() {
    // 컴포넌트가 파괴될 때 WebSocket 구독 해제
    this.cleanup()
  },
  
  methods: {
    async initialize() {
      try {
        this.loading = true
        this.error = null
        
        // 채팅방 정보 로드
        await this.loadChatRoom()
        
        // 메시지 로드
        await this.loadMessages()
        
        // WebSocket 연결 및 구독
        await this.setupWebSocket()
        
        // 메시지 읽음 처리
        this.markMessagesAsRead()
        
        this.loading = false
      } catch (error) {
        console.error('채팅방 초기화 오류:', error)
        this.error = error.message || '채팅방을 불러오는 중 오류가 발생했습니다.'
        this.loading = false
      }
    },
    
    async loadChatRoom() {
      try {
        console.log('loadChatRoom 호출됨, currentRoomId:', this.currentRoomId)
        const response = await chatService.getChatRoom(this.currentRoomId)
        this.chatRoom = response.data
        
        // 상품 판매 완료 상태 체크
        this.checkProductSoldStatus()
        
        console.log('채팅방 정보 로드 완료:', this.chatRoom)
      } catch (error) {
        console.error('채팅방 정보 로드 실패:', error)
        throw new Error('채팅방 정보를 불러올 수 없습니다.')
      }
    },
    
    async loadMessages() {
      try {
        const response = await chatService.getChatMessages(this.currentRoomId)
        this.messages = response.data.messages || []
        console.log('채팅 메시지 로드 완료:', this.messages)
      } catch (error) {
        console.error('채팅 메시지 로드 실패:', error)
        throw new Error('채팅 메시지를 불러올 수 없습니다.')
      }
    },
    
    async setupWebSocket() {
      try {
        // WebSocket 연결
        if (!websocketService.isSocketConnected()) {
          console.log('WebSocket 연결 시작...')
          await websocketService.connect(this.token)
        }
        
        // 연결이 완전히 설정될 때까지 잠시 대기
        let retryCount = 0
        const maxRetries = 10
        
        while (!websocketService.isSocketConnected() && retryCount < maxRetries) {
          console.log(`WebSocket 연결 대기 중... (${retryCount + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 500))
          retryCount++
        }
        
        if (!websocketService.isSocketConnected()) {
          throw new Error('WebSocket 연결 시간 초과')
        }
        
        console.log('WebSocket 연결 확인됨, 채팅방 구독 시작...')
        
        // 채팅방 구독
        websocketService.subscribeToChatRoom(
          this.currentRoomId,
          this.handleNewMessage,
          this.handleReadStatusUpdate
        )
        
        console.log('WebSocket 설정 완료')
      } catch (error) {
        console.error('WebSocket 설정 실패:', error)
        throw new Error('실시간 채팅 연결에 실패했습니다.')
      }
    },
    
    async sendMessage() {
      const messageText = this.newMessage.trim()
      if (!messageText || this.isProductSold || this.chatRoom.status !== 'ACTIVE') {
        return
      }
      
      // WebSocket 연결 상태 확인
      if (!websocketService.isSocketConnected()) {
        alert('채팅 연결이 끊어졌습니다. 페이지를 새로고침해주세요.')
        return
      }
      
      try {
        await websocketService.sendMessage(this.currentRoomId, messageText)
        this.newMessage = '' // 입력창 초기화
        
        // 메시지 전송 후 스크롤을 항상 아래로 이동
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      } catch (error) {
        console.error('메시지 전송 실패:', error)
        alert('메시지 전송에 실패했습니다. 다시 시도해주세요.')
      }
    },
    
    handleNewMessage(message) {
      // 새 메시지 추가
      this.messages.push(message)
      
      // 내가 보낸 메시지가 아닌 경우에만 읽음 처리
      if (message.senderId !== this.currentUserId) {
        this.markMessagesAsRead()
      }
      
      // 자동 스크롤이 활성화되어 있으면 스크롤 이동
      if (this.isAutoScrollEnabled) {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },
    
    handleReadStatusUpdate(senderId) {
      // 상대방이 메시지를 읽었을 때 UI 업데이트
      if (Number(senderId) !== this.currentUserId) {
        // 내 메시지의 읽음 상태 업데이트
        this.messages.forEach(message => {
          if (message.senderId === this.currentUserId) {
            message.isRead = true
          }
        })
      }
    },
    
    markMessagesAsRead() {
      // 메시지 읽음 처리 API 호출
      websocketService.markAsRead(this.currentRoomId)
      
      // UI에서도 읽음 상태 업데이트
      this.messages.forEach(message => {
        if (message.senderId !== this.currentUserId) {
          message.isRead = true
        }
      })
    },
    
    scrollToBottom() {
      const container = this.$refs.messageContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    
    handleScroll(event) {
      const container = event.target
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100
      
      // 사용자가 스크롤을 위로 올리면 자동 스크롤 비활성화
      // 아래로 충분히 내리면 다시 활성화
      this.isAutoScrollEnabled = isAtBottom
    },
    
    formatMessageTime(timestamp) {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      
      return `${hours}:${minutes}`
    },
    
    truncate(str, length) {
      if (!str) return ''
      return str.length > length ? str.substring(0, length) + '...' : str
    },
    
    goToProduct() {
      if (this.chatRoom && this.chatRoom.productId) {
        this.$router.push(`/products/${this.chatRoom.productId}`)
      }
    },
    
    reloadPage() {
      window.location.reload()
    },
    
    checkProductSoldStatus() {
      // 채팅방 정보에서 상품 판매 상태 확인
      this.isProductSold = this.chatRoom.status === 'SOLD_OUT'
    },
    
    async markAsSold() {
      if (!this.isSeller) return
      
      try {
        if (confirm('이 구매자에게 상품을 판매하시겠습니까?')) {
          // API 호출
          const response = await fetch(`${this.apiUrl}/api/products/${this.chatRoom.productId}/sold`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({
              buyerId: this.chatRoom.buyerId,
              chatRoomId: Number(this.currentRoomId)
            })
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || '판매 완료 처리에 실패했습니다.')
          }
          
          // 성공 시 상태 업데이트
          this.isProductSold = true
          alert('판매가 완료되었습니다.')
          
          // 채팅방 정보 갱신
          this.loadChatRoom()
        }
      } catch (error) {
        console.error('판매 완료 처리 오류:', error)
        alert(error.message || '판매 완료 처리 중 오류가 발생했습니다.')
      }
    },
    
    cleanup() {
      // WebSocket 구독 해제
      if (websocketService.isSocketConnected()) {
        websocketService.unsubscribeFromChatRoom(this.currentRoomId)
      }
    }
  }
}
</script>

<style scoped>
/* 스크롤바 스타일링 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
