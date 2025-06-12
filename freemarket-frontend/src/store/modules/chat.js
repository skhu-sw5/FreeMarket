import { Stomp } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { WS_BASE_URL } from '@/config'
import { apiPost, apiGet } from '@/utils/api'

const state = {
  client: null,
  connected: false,
  chatRooms: [],
  currentRoom: null,
  messages: [],
  loading: false,
  error: null
}

const mutations = {
  SET_CLIENT(state, client) {
    state.client = client
  },
  
  SET_CONNECTED(state, status) {
    state.connected = status
  },
  
  SET_CHAT_ROOMS(state, rooms) {
    state.chatRooms = rooms
  },
  
  SET_CURRENT_ROOM(state, room) {
    state.currentRoom = room
  },
  
  SET_MESSAGES(state, messages) {
    state.messages = messages
  },
  
  ADD_MESSAGE(state, message) {
    state.messages.push(message)
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  CLEAR_ERROR(state) {
    state.error = null
  }
}

const actions = {
  // WebSocket 연결
  async connectWebSocket({ commit, state, rootState }) {
    try {
      if (state.client && state.connected) {
        console.log('이미 WebSocket에 연결되어 있습니다.')
        return
      }

      const token = rootState.auth.token
      if (!token) {
        throw new Error('인증 토큰이 없습니다.')
      }

      console.log('WebSocket 연결 시도...')
      
      const socket = new SockJS(`${WS_BASE_URL}/ws/chat`)
      const client = Stomp.over(socket)
      
      // STOMP 디버그 설정
      client.debug = (str) => {
        console.log('STOMP Debug:', str)
      }
      
      commit('SET_CLIENT', client)
      
      const connectHeaders = {
        'Authorization': `Bearer ${token}`
      }
      
      await new Promise((resolve, reject) => {
        client.connect(
          connectHeaders,
          (frame) => {
            console.log('WebSocket 연결 성공:', frame)
            commit('SET_CONNECTED', true)
            resolve(frame)
          },
          (error) => {
            console.error('WebSocket 연결 실패:', error)
            commit('SET_ERROR', 'WebSocket 연결 오류')
            commit('SET_CONNECTED', false)
            reject(error)
          }
        )
      })
      
    } catch (error) {
      console.error('WebSocket 연결 오류:', error)
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  // WebSocket 연결 해제
  disconnectWebSocket({ commit, state }) {
    if (state.client) {
      state.client.disconnect()
      commit('SET_CLIENT', null)
      commit('SET_CONNECTED', false)
      console.log('WebSocket 연결 해제 완료')
    }
  },

  // 채팅방 생성
  async createChatRoom({ commit }, productId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const result = await apiPost('/api/chat/rooms', { productId })
      console.log('채팅방 생성 성공:', result)
      
      return result.data
    } catch (error) {
      console.error('채팅방 생성 오류:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 채팅방 정보 조회
  async fetchChatRoom({ commit }, roomId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const result = await apiGet(`/api/chat/rooms/${roomId}`)
      commit('SET_CURRENT_ROOM', result.data)
      
      return result.data
    } catch (error) {
      console.error('채팅방 조회 오류:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 채팅방 메시지 목록 조회
  async fetchMessages({ commit }, roomId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const result = await apiGet(`/api/chat/rooms/${roomId}/messages`)
      commit('SET_MESSAGES', result.data.messages || [])
      
      return result.data
    } catch (error) {
      console.error('메시지 조회 오류:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 채팅방 구독
  subscribeToChatRoom({ commit, state }, roomId) {
    if (!state.client || !state.connected) {
      throw new Error('WebSocket이 연결되지 않았습니다.')
    }

    try {
      // 메시지 구독
      state.client.subscribe(`/topic/chat/${roomId}`, (message) => {
        const messageData = JSON.parse(message.body)
        console.log('새 메시지 수신:', messageData)
        commit('ADD_MESSAGE', messageData)
      })

      // 읽음 처리 구독
      state.client.subscribe(`/topic/chat/${roomId}/read`, (message) => {
        console.log('읽음 처리 알림:', message.body)
        // 읽음 처리 로직 구현
      })

      console.log(`채팅방 ${roomId} 구독 완료`)
    } catch (error) {
      console.error('채팅방 구독 오류:', error)
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  // 메시지 전송
  sendMessage({ state }, { roomId, content }) {
    if (!state.client || !state.connected) {
      throw new Error('WebSocket이 연결되지 않았습니다.')
    }

    try {
      state.client.send(
        `/app/chat/${roomId}/send`,
        {},
        JSON.stringify({
          content,
          messageType: 'TEXT'
        })
      )
      
      console.log('메시지 전송:', content)
    } catch (error) {
      console.error('메시지 전송 오류:', error)
      throw error
    }
  },

  // 메시지 읽음 처리
  markAsRead({ state }, roomId) {
    if (!state.client || !state.connected) {
      throw new Error('WebSocket이 연결되지 않았습니다.')
    }

    try {
      state.client.send(
        `/app/chat/${roomId}/read`,
        {},
        '{}'
      )
      
      console.log(`채팅방 ${roomId} 읽음 처리`)
    } catch (error) {
      console.error('읽음 처리 오류:', error)
      throw error
    }
  },

  // 내 채팅방 목록 조회
  async fetchMyChatRooms({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const result = await apiGet('/api/chat/rooms')
      commit('SET_CHAT_ROOMS', result.data.chatRooms || [])
      
      return result.data
    } catch (error) {
      console.error('채팅방 목록 조회 오류:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  isConnected: state => state.connected,
  currentRoom: state => state.currentRoom,
  messages: state => state.messages,
  chatRooms: state => state.chatRooms,
  loading: state => state.loading,
  error: state => state.error
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
