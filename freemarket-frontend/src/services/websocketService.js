import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs'
import { WS_BASE_URL, WS_ENDPOINT } from '../config'
import wsDebugger from '../utils/websocketDebugger'

class WebSocketService {
  constructor() {
    this.stompClient = null
    this.subscriptions = new Map()
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.messageCallbacks = new Map()
    this.readCallbacks = new Map()
    this.connectionPromise = null
  }

  // WebSocket 연결
  async connect(token) {
    if (this.isConnected) {
      console.log('이미 WebSocket에 연결되어 있습니다.')
      return Promise.resolve()
    }

    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // SockJS는 자동으로 적절한 프로토콜(ws, wss)을 선택합니다
        const socketUrl = `${WS_BASE_URL}${WS_ENDPOINT}`
        console.log('🔌 WebSocket 연결 시도...', socketUrl)
        
        // CORS 및 연결 디버깅 정보 출력
        wsDebugger.logCorsInfo(socketUrl)
        wsDebugger.testNetworkRequest(WS_BASE_URL)
        
        // SockJS 인스턴스 생성
        console.log('🔧 SockJS 인스턴스 생성 중...')
        
        // 안전하게 소켓 생성
        let socket = null;
        try {
          socket = new SockJS(socketUrl);
          console.log('🔧 SockJS 인스턴스 생성 성공', socket);
        } catch (sockError) {
          console.error('🔧 SockJS 인스턴스 생성 실패:', sockError);
          
          // 네이티브 WebSocket으로 대체 시도
          try {
            const wsUrl = socketUrl.replace('http://', 'ws://').replace('https://', 'wss://');
            console.log('🔄 네이티브 WebSocket으로 대체 시도:', wsUrl);
            socket = new WebSocket(wsUrl);
            console.log('🔧 네이티브 WebSocket 인스턴스 생성 성공');
          } catch (wsError) {
            console.error('🔧 네이티브 WebSocket 인스턴스 생성 실패:', wsError);
            this.connectionPromise = null;
            reject(wsError);
            return;
          }
        }
        
        // STOMP 클라이언트 생성
        try {
          this.stompClient = Stomp.over(socket);
          console.log('🔧 STOMP 클라이언트 생성 성공');
        } catch (stompError) {
          console.error('🔧 STOMP 클라이언트 생성 실패:', stompError);
          this.connectionPromise = null;
          reject(stompError);
          return;
        }
        
        // STOMP 디버그 설정 (개발 환경에서만)
        if (process.env.NODE_ENV === 'development') {
          this.stompClient.debug = (str) => {
            console.log('STOMP: ' + str)
          }
        } else {
          this.stompClient.debug = () => {}
        }

        const connectHeaders = {
          'Authorization': `Bearer ${token}`,
          'Accept-Version': '1.0,1.1,2.0',
          'Heart-beat': '10000,10000'
        }

        // 헤더 디버깅
        wsDebugger.logHeaders(connectHeaders)
        wsDebugger.logConnectionAttempt(socketUrl, { headers: connectHeaders })

        // 연결 타임아웃 설정
        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            console.error('⏱️ WebSocket 연결 타임아웃');
            this.connectionPromise = null;
            reject(new Error('WebSocket 연결 타임아웃'));
          }
        }, 15000); // 15초 타임아웃

        this.stompClient.connect(
          connectHeaders,
          (frame) => {
            clearTimeout(connectionTimeout);
            console.log('✅ WebSocket 연결 성공:', frame)
            wsDebugger.logConnectionSuccess(frame)
            this.isConnected = true
            this.reconnectAttempts = 0
            this.connectionPromise = null
            resolve()
          },
          (error) => {
            clearTimeout(connectionTimeout);
            console.error('❌ WebSocket 연결 실패:', error)
            wsDebugger.logConnectionError(error)
            this.isConnected = false
            this.connectionPromise = null
            
            // 재연결 시도
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
              this.reconnectAttempts++
              console.log(`🔄 WebSocket 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
              
              const backoffTime = Math.min(2000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
              console.log(`⏱️ 재연결 대기 시간: ${backoffTime}ms`);
              
              setTimeout(() => {
                this.connect(token).catch(reject)
              }, backoffTime)
            } else {
              console.error('❌ 최대 재연결 시도 횟수 초과');
              reject(new Error('WebSocket 연결에 실패했습니다. 최대 재연결 시도 횟수 초과'))
            }
          }
        )
      } catch (error) {
        console.error('WebSocket 연결 설정 오류:', error)
        this.connectionPromise = null
        reject(error)
      }
    })

    return this.connectionPromise
  }

  // WebSocket 연결 해제
  disconnect() {
    console.log('🔌 WebSocket 연결 해제')
    
    // 모든 구독 해제
    this.subscriptions.forEach((subscription) => {
      if (subscription && typeof subscription === 'object') {
        Object.values(subscription).forEach(sub => {
          if (sub && typeof sub.unsubscribe === 'function') {
            try {
              sub.unsubscribe();
            } catch (e) {
              console.error('구독 해제 중 오류:', e);
            }
          }
        });
      }
    })
    this.subscriptions.clear()
    this.messageCallbacks.clear()
    this.readCallbacks.clear()

    if (this.stompClient && this.stompClient.connected) {
      try {
        this.stompClient.disconnect(() => {
          console.log('WebSocket 연결이 정상적으로 해제되었습니다.')
        })
      } catch (e) {
        console.error('WebSocket 연결 해제 중 오류:', e);
      }
    }

    this.isConnected = false
    this.stompClient = null
    this.connectionPromise = null
  }

  // 채팅방 구독
  subscribeToChatRoom(roomId, onMessage, onReadStatusUpdate) {
    if (!this.isConnected || !this.stompClient || !this.stompClient.connected) {
      console.error('WebSocket이 연결되지 않았습니다. 연결 상태:', {
        isConnected: this.isConnected,
        hasStompClient: !!this.stompClient,
        stompConnected: this.stompClient ? this.stompClient.connected : false
      })
      throw new Error('WebSocket이 연결되지 않았습니다.')
    }

    console.log(`📨 채팅방 ${roomId} 구독 시작`)

    try {
      // 이미 구독 중인지 확인
      if (this.subscriptions.has(roomId)) {
        console.log(`채팅방 ${roomId}에 이미 구독 중입니다.`);
        return this.subscriptions.get(roomId);
      }
      
      const subscriptionGroup = {};
      
      // 메시지 구독
      try {
        const messageDestination = `/topic/chat/${roomId}`;
        console.log(`메시지 구독: ${messageDestination}`);
        
        const messageSubscription = this.stompClient.subscribe(
          messageDestination,
          (message) => {
            try {
              const messageData = JSON.parse(message.body)
              console.log('📨 새 메시지 수신:', messageData)
              
              if (onMessage) {
                onMessage(messageData)
              }
            } catch (error) {
              console.error('메시지 파싱 오류:', error)
            }
          }
        );
        subscriptionGroup.message = messageSubscription;
      } catch (msgError) {
        console.error('메시지 구독 실패:', msgError);
      }

      // 읽음 상태 구독
      try {
        const readDestination = `/topic/chat/${roomId}/read`;
        console.log(`읽음 상태 구독: ${readDestination}`);
        
        const readSubscription = this.stompClient.subscribe(
          readDestination,
          (message) => {
            try {
              console.log('📖 읽음 상태 업데이트:', message.body)
              
              if (onReadStatusUpdate) {
                onReadStatusUpdate(message.body)
              }
            } catch (error) {
              console.error('읽음 상태 처리 오류:', error)
            }
          }
        );
        subscriptionGroup.read = readSubscription;
      } catch (readError) {
        console.error('읽음 상태 구독 실패:', readError);
      }

      // 에러 구독
      try {
        const errorDestination = `/topic/chat/${roomId}/error`;
        console.log(`에러 구독: ${errorDestination}`);
        
        const errorSubscription = this.stompClient.subscribe(
          errorDestination,
          (error) => {
            console.error('❌ 채팅 에러:', error.body)
          }
        );
        subscriptionGroup.error = errorSubscription;
      } catch (errError) {
        console.error('에러 구독 실패:', errError);
      }

      // 구독 정보 저장
      this.subscriptions.set(roomId, subscriptionGroup);
      return subscriptionGroup;
    } catch (error) {
      console.error('채팅방 구독 오류:', error)
      return null
    }
  }

  // 채팅방 구독 해제
  unsubscribeFromChatRoom(roomId) {
    console.log(`📭 채팅방 ${roomId} 구독 해제`)
    
    const subscriptions = this.subscriptions.get(roomId)
    if (subscriptions) {
      Object.values(subscriptions).forEach(subscription => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          try {
            subscription.unsubscribe()
          } catch (e) {
            console.error('구독 해제 중 오류:', e);
          }
        }
      })
      this.subscriptions.delete(roomId)
    }
  }

  // 메시지 전송
  sendMessage(roomId, content, messageType = 'TEXT') {
    if (!this.isConnected || !this.stompClient || !this.stompClient.connected) {
      console.error('WebSocket이 연결되지 않았습니다. 연결 상태:', {
        isConnected: this.isConnected,
        hasStompClient: !!this.stompClient,
        stompConnected: this.stompClient ? this.stompClient.connected : false
      })
      throw new Error('WebSocket이 연결되지 않았습니다.')
    }

    try {
      console.log(`📤 메시지 전송 to 채팅방 ${roomId}:`, content)
      
      const destination = `/app/chat/${roomId}/send`;
      const body = JSON.stringify({
        content: content,
        messageType: messageType
      });
      
      console.log(`전송 대상: ${destination}`);
      console.log(`전송 내용: ${body}`);
      
      this.stompClient.send(
        destination,
        {},
        body
      )
    } catch (error) {
      console.error('메시지 전송 오류:', error)
      throw error
    }
  }

  // 읽음 처리
  markAsRead(roomId) {
    if (!this.isConnected || !this.stompClient || !this.stompClient.connected) {
      console.error('WebSocket이 연결되지 않았습니다. 연결 상태:', {
        isConnected: this.isConnected,
        hasStompClient: !!this.stompClient,
        stompConnected: this.stompClient ? this.stompClient.connected : false
      })
      return
    }

    try {
      console.log(`📖 읽음 처리 요청 for 채팅방 ${roomId}`)
      
      this.stompClient.send(
        `/app/chat/${roomId}/read`,
        {},
        '{}'
      )
    } catch (error) {
      console.error('읽음 처리 오류:', error)
    }
  }

  // 연결 상태 확인
  isSocketConnected() {
    return this.isConnected && this.stompClient && this.stompClient.connected
  }
  
  // 연결 재시도
  async reconnect(token) {
    if (this.isConnected) {
      // 이미 연결되어 있으면 먼저 연결 해제
      this.disconnect();
    }
    
    // 잠시 대기 후 재연결
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 재연결 시도
    this.reconnectAttempts = 0;
    return this.connect(token);
  }
}

export default new WebSocketService()
