<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- 헤더 -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">채팅</h1>
        <p class="text-gray-600">구매자와 판매자 간의 대화를 확인하세요</p>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">채팅방 목록을 불러오는 중...</span>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>
          <span class="text-red-700">{{ error }}</span>
        </div>
        <button 
          @click="loadChatRooms" 
          class="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          다시 시도
        </button>
      </div>

      <!-- 채팅방 목록 -->
      <div v-else-if="chatRooms.length > 0" class="space-y-3">
        <div 
          v-for="room in chatRooms" 
          :key="room.chatRoomId"
          @click="enterChatRoom(room.chatRoomId)"
          class="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <h3 class="font-medium text-gray-900 mr-2">{{ room.productName }}</h3>
                <span v-if="room.unreadCount > 0" class="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {{ room.unreadCount }}
                </span>
              </div>
              
              <div class="flex items-center text-sm text-gray-600 mb-2">
                <i class="far fa-user mr-1"></i>
                <span>{{ getOtherUserName(room) }}</span>
                <span class="mx-2">•</span>
                <span>{{ getUserRole(room) }}</span>
              </div>
              
              <div v-if="room.lastMessage" class="text-sm text-gray-700">
                {{ room.lastMessage }}
              </div>
              <div v-else class="text-sm text-gray-400 italic">
                아직 메시지가 없습니다
              </div>
            </div>
            
            <div class="text-right">
              <div v-if="room.lastMessageTime" class="text-xs text-gray-500 mb-1">
                {{ formatTime(room.lastMessageTime) }}
              </div>
              <div class="text-xs text-gray-400">
                {{ room.status === 'ACTIVE' ? '활성' : '비활성' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-else class="text-center py-12">
        <div class="mb-4">
          <i class="far fa-comments text-6xl text-gray-300"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">채팅방이 없습니다</h3>
        <p class="text-gray-600 mb-6">상품 구매나 판매를 통해 첫 채팅을 시작해보세요</p>
        <router-link to="/" class="button-primary">
          상품 둘러보기
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ChatList',
  
  data() {
    return {
      loading: false,
      error: null
    }
  },
  
  computed: {
    ...mapGetters('chat', ['chatRooms']),
    ...mapGetters('auth', ['currentUser'])
  },
  
  async mounted() {
    await this.loadChatRooms()
  },
  
  methods: {
    ...mapActions('chat', ['fetchMyChatRooms']),
    
    async loadChatRooms() {
      try {
        this.loading = true
        this.error = null
        await this.fetchMyChatRooms()
      } catch (error) {
        console.error('채팅방 목록 로딩 실패:', error)
        this.error = error.message || '채팅방 목록을 불러올 수 없습니다.'
      } finally {
        this.loading = false
      }
    },
    
    enterChatRoom(roomId) {
      this.$router.push(`/chat/${roomId}`)
    },
    
    getOtherUserName(room) {
      if (!this.currentUser) return ''
      
      // 현재 사용자가 구매자인 경우 판매자 이름을, 판매자인 경우 구매자 이름을 반환
      if (room.buyerId === this.currentUser.id) {
        return room.sellerName || '판매자'
      } else {
        return room.buyerName || '구매자'
      }
    },
    
    getUserRole(room) {
      if (!this.currentUser) return ''
      
      // 현재 사용자의 역할을 반환
      if (room.buyerId === this.currentUser.id) {
        return '구매 문의'
      } else {
        return '판매 응답'
      }
    },
    
    formatTime(timestamp) {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMins < 1) {
        return '방금 전'
      } else if (diffMins < 60) {
        return `${diffMins}분 전`
      } else if (diffHours < 24) {
        return `${diffHours}시간 전`
      } else if (diffDays < 7) {
        return `${diffDays}일 전`
      } else {
        return date.toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric'
        })
      }
    }
  }
}
</script>

<style scoped>
.button-primary {
  @apply px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors;
}
</style>