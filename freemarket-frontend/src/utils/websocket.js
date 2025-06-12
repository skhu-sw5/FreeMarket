import { Stomp } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { WS_BASE_URL } from '@/config'

class WebSocketManager {
  constructor() {
    this.client = null
    this.isConnected = false
    this.messageHandlers = new Map()
    this.connectionPromise = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
  }

  connect(token) {
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      console.log('🔌 WebSocket 연결 시도...')

      // SockJS를 통한 WebSocket 연결
      const socket = new SockJS(`${WS_BASE_URL}/ws/chat`)
      this.client = Stomp.over(socket)
      
      // STOMP 디버그 설정
      this.client.debug = (str) => {
        console.log('🔌 STOMP:', str)
      }
      
      const connectHeaders = {
        'Authorization': `Bearer ${token}`,
        'Accept-Version': '1.0,1.1,2.0',
        'Heart-beat': '10000,10000'
      }
      
      this.client.connect(
        connectHeaders,
        (frame) => {
          console.log('✅ WebSocket 연결 성공:', frame)
          this.isConnected = true
          this.reconnectAttempts = 0
          this.connectionPromise = null
          resolve(frame)
        },
        (error) => {
          console.error('❌ WebSocket 연결 실패:', error)
          this.isConnected = false
          this.connectionPromise = null
          
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`🔄 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
            setTimeout(() => {
              this.connect(token).catch(reject)
            }, this.reconnectDelay * this.reconnectAttempts)
          } else {
            reject(new Error('WebSocket 연결에 실패했습니다.'))
          }
        }
      )
    })

    return this.connectionPromise
  }

  disconnect() {
    if (this.client && this.isConnected) {
      console.log('🔌 WebSocket 연결 해제')
      this.client.disconnect()
      this.isConnected = false
      this.connectionPromise = null
    }
  }

  subscribe(destination, callback) {
    if (!this.isConnected || !this.client) {
      throw new Error('WebSocket이 연결되지 않았습니다.')
    }

    const subscription = this.client.subscribe(destination, callback)
    this.messageHandlers.set(destination, subscription)
    return subscription
  }

  unsubscribe(destination) {
    const subscription = this.messageHandlers.get(destination)
    if (subscription) {
      subscription.unsubscribe()
      this.messageHandlers.delete(destination)
    }
  }

  send(destination, headers = {}, body = '{}') {
    if (!this.isConnected || !this.client) {
      throw new Error('WebSocket이 연결되지 않았습니다.')
    }

    this.client.send(destination, headers, body)
  }

  isConnectedToWebSocket() {
    return this.isConnected && this.client && this.client.connected
  }
}

export default new WebSocketManager()
