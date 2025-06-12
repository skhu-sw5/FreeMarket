import api from './api'

class ChatService {
  // 채팅방 생성
  async createChatRoom(productId) {
    try {
      console.log('🔧 채팅방 생성 요청:', productId)
      const response = await api.post('/api/chat/rooms', {
        productId: productId
      })
      console.log('✅ 채팅방 생성 성공:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ 채팅방 생성 실패:', error)
      
      // 이미 존재하는 채팅방인 경우 기존 채팅방 정보를 가져옴
      if (error.response && error.response.status === 409) {
        console.log('🔍 기존 채팅방 조회 시도...')
        try {
          const chatRooms = await this.getMyChatRooms()
          const existingRoom = chatRooms.data.chatRooms.find(room => room.productId === productId)
          if (existingRoom) {
            console.log('✅ 기존 채팅방 발견:', existingRoom)
            return { data: existingRoom }
          }
        } catch (fetchError) {
          console.error('기존 채팅방 조회 실패:', fetchError)
        }
      }
      
      throw error
    }
  }

  // 내 채팅방 목록 조회
  async getMyChatRooms(page = 0, size = 20) {
    try {
      const response = await api.get('/api/chat/rooms', {
        params: { page, size }
      })
      return response.data
    } catch (error) {
      console.error('채팅방 목록 조회 실패:', error)
      throw error
    }
  }

  // 특정 채팅방 조회
  async getChatRoom(roomId) {
    try {
      const response = await api.get(`/api/chat/rooms/${roomId}`)
      return response.data
    } catch (error) {
      console.error('채팅방 조회 실패:', error)
      throw error
    }
  }

  // 채팅방 메시지 목록 조회
  async getChatMessages(roomId, page = 0, size = 20) {
    try {
      const response = await api.get(`/api/chat/rooms/${roomId}/messages`, {
        params: { page, size }
      })
      return response.data
    } catch (error) {
      console.error('채팅 메시지 조회 실패:', error)
      throw error
    }
  }

  // 메시지 읽음 처리
  async markMessagesAsRead(roomId) {
    try {
      const response = await api.post(`/api/chat/rooms/${roomId}/read`)
      return response.data
    } catch (error) {
      console.error('메시지 읽음 처리 실패:', error)
      throw error
    }
  }

  // 읽지 않은 메시지 개수 조회
  async getUnreadMessageCount(roomId) {
    try {
      const response = await api.get(`/api/chat/rooms/${roomId}/unread-count`)
      return response.data
    } catch (error) {
      console.error('읽지 않은 메시지 개수 조회 실패:', error)
      throw error
    }
  }

  // 채팅방 상태 변경
  async updateChatRoomStatus(roomId, status) {
    try {
      const response = await api.patch(`/api/chat/rooms/${roomId}/status`, null, {
        params: { status }
      })
      return response.data
    } catch (error) {
      console.error('채팅방 상태 변경 실패:', error)
      throw error
    }
  }

  // 상품별 채팅방 목록 조회 (판매자용)
  async getProductChatRooms(productId) {
    try {
      const response = await api.get(`/api/chat/products/${productId}/chat-rooms`)
      return response.data
    } catch (error) {
      console.error('상품 채팅방 목록 조회 실패:', error)
      throw error
    }
  }
}

export default new ChatService()
