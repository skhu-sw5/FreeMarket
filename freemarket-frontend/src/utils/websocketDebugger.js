/**
 * WebSocket 연결 디버깅을 위한 유틸리티 클래스
 */
class WebSocketDebugger {
  constructor() {
    this.logEnabled = process.env.NODE_ENV === 'development';
  }

  /**
   * WebSocket 요청 헤더를 로깅합니다
   * @param {Object} headers - 헤더 객체
   */
  logHeaders(headers) {
    if (!this.logEnabled) return;

    console.group('📝 WebSocket 요청 헤더');
    
    // Authorization 헤더는 보안을 위해 일부만 표시
    const sanitizedHeaders = { ...headers };
    if (sanitizedHeaders.Authorization) {
      sanitizedHeaders.Authorization = 
        sanitizedHeaders.Authorization.substring(0, 15) + '...';
    }
    
    console.table(sanitizedHeaders);
    console.groupEnd();
  }

  /**
   * CORS 디버깅 정보를 출력합니다
   * @param {string} url - 연결 URL
   */
  logCorsInfo(url) {
    if (!this.logEnabled) return;

    console.group('🌐 CORS 디버깅 정보');
    console.log('연결 URL:', url);
    console.log('프로토콜:', window.location.protocol);
    console.log('호스트:', window.location.host);
    console.log('오리진:', window.location.origin);
    console.log('현재 페이지:', window.location.href);
    
    // 현재 페이지와 대상 URL의 도메인 비교
    try {
      const pageOrigin = new URL(window.location.href).origin;
      const targetOrigin = new URL(url).origin;
      console.log('현재 페이지 오리진:', pageOrigin);
      console.log('대상 URL 오리진:', targetOrigin);
      console.log('동일 오리진?', pageOrigin === targetOrigin ? '✅' : '❌');
      
      if (pageOrigin !== targetOrigin) {
        console.log('⚠️ 다른 오리진 (CORS 관련 문제 가능성 있음)');
      }
    } catch (error) {
      console.error('URL 분석 오류:', error);
    }
    
    console.groupEnd();
  }

  /**
   * 연결 시도 정보를 로깅합니다
   * @param {string} url - 연결 URL
   * @param {Object} options - 연결 옵션
   */
  logConnectionAttempt(url, options = {}) {
    if (!this.logEnabled) return;

    console.group('🔌 WebSocket 연결 시도');
    console.log('URL:', url);
    console.log('옵션:', options);
    console.groupEnd();
  }

  /**
   * 연결 성공 정보를 로깅합니다
   * @param {Object} frame - 연결 프레임 정보
   */
  logConnectionSuccess(frame) {
    if (!this.logEnabled) return;

    console.group('✅ WebSocket 연결 성공');
    console.log('프레임:', frame);
    console.log('연결 시간:', new Date().toISOString());
    console.groupEnd();
  }

  /**
   * 연결 실패 정보를 로깅합니다
   * @param {Error} error - 오류 객체
   */
  logConnectionError(error) {
    if (!this.logEnabled) return;

    console.group('❌ WebSocket 연결 실패');
    console.error('오류:', error);
    console.log('시간:', new Date().toISOString());
    
    // 일반적인 WebSocket 오류 원인 제안
    console.log('가능한 원인:');
    console.log('1. CORS 설정 오류');
    console.log('2. 서버가 실행 중이지 않음');
    console.log('3. 네트워크 문제');
    console.log('4. 프록시 설정 오류');
    console.log('5. 인증 오류');
    console.log('6. WebSocket 엔드포인트 경로 불일치');
    console.log('7. SockJS 버전 충돌');
    
    // 문제 해결 제안
    console.log('\n문제 해결 제안:');
    console.log('1. 네트워크 요청 테스트 확인');
    console.log('2. 백엔드 CORS 설정 확인');
    console.log('3. 인증 토큰 유효성 확인');
    console.log('4. 엔드포인트 경로 확인 (/ws vs /ws/chat 등)');
    console.log('5. 브라우저 개발자 도구 네트워크 탭 확인');
    console.groupEnd();
  }

  /**
   * 네트워크 요청 테스트를 수행합니다
   * @param {string} url - 테스트할 URL
   */
  async testNetworkRequest(url) {
    if (!this.logEnabled) return;

    console.group('🧪 네트워크 요청 테스트');
    try {
      console.log('테스트 URL:', url);
      
      // 1. 먼저 OPTIONS 요청으로 CORS 설정 확인
      try {
        const optionsStartTime = Date.now();
        const optionsResponse = await fetch(url, { 
          method: 'OPTIONS',
          mode: 'cors',
          headers: {
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Authorization'
          }
        });
        const optionsEndTime = Date.now();
        
        console.log('OPTIONS 응답 상태:', optionsResponse.status);
        console.log('OPTIONS 응답 시간:', optionsEndTime - optionsStartTime, 'ms');
        
        const optionsHeaders = {};
        optionsResponse.headers.forEach((value, key) => {
          optionsHeaders[key] = value;
        });
        
        console.log('OPTIONS 응답 헤더:', optionsHeaders);
        
        // CORS 헤더 분석
        const corsOk = optionsHeaders['access-control-allow-origin'] ? '✅' : '❌';
        console.log('CORS 헤더 존재 여부:', corsOk);
        
        if(corsOk === '❌') {
          console.warn('⚠️ CORS 설정 문제가 있습니다!');
        }
      } catch (optionsError) {
        console.error('OPTIONS 요청 실패:', optionsError);
      }
      
      // 2. 실제 GET 요청 테스트
      try {
        const getStartTime = Date.now();
        const getResponse = await fetch(url, { 
          method: 'GET',
          mode: 'cors'
        });
        const getEndTime = Date.now();
        
        console.log('GET 응답 상태:', getResponse.status);
        console.log('GET 응답 시간:', getEndTime - getStartTime, 'ms');
        
        const getHeaders = {};
        getResponse.headers.forEach((value, key) => {
          getHeaders[key] = value;
        });
        
        console.log('GET 응답 헤더:', getHeaders);
      } catch (getError) {
        console.error('GET 요청 실패:', getError);
      }

      // 3. 웹소켓 정보 확인
      console.log('WebSocket 관련 정보:');
      console.log('- 네이티브 WebSocket 지원 여부:', 'WebSocket' in window ? '✅' : '❌');
      console.log('- SockJS 로드 여부:', typeof SockJS !== 'undefined' ? '✅' : '❌');
      
      // 4. SockJS 엔드포인트 테스트
      console.log('📋 SockJS 사용을 위한 필수 엔드포인트:');
      const wsEndpoints = [
        `${url}/ws/chat/info`,
        `${url}/ws/chat/websocket`
      ];
      
      for (const endpoint of wsEndpoints) {
        try {
          console.log(`테스트 중: ${endpoint}`);
          const response = await fetch(endpoint, { mode: 'cors' });
          console.log(`- ${endpoint}: ${response.status} ${response.statusText}`);
        } catch (error) {
          console.error(`- ${endpoint}: 요청 실패`, error);
        }
      }
      
    } catch (error) {
      console.error('네트워크 요청 테스트 전체 실패:', error);
    }
    console.groupEnd();
  }
}

export default new WebSocketDebugger();
