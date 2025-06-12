// API 서버 기본 URL 설정
// 환경에 따라 적절한 URL 사용

// 환경 변수에서 NODE_ENV 가져오기
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// API 서버 URL 설정
const API_BASE_URL = 'https://freemarket.duckdns.org';

// WebSocket URL 설정 - HTTPS 환경에서도 SockJS가 프로토콜 변환을 처리하므로 동일 URL 사용
const WS_BASE_URL = 'https://freemarket.duckdns.org';

// WebSocket 엔드포인트 설정 - 백엔드 설정과 일치해야 함
const WS_ENDPOINT = '/ws/chat';

// 상수 정의
const CONSTANTS = {
  TOKEN_KEY: 'accessToken',
  REFRESH_TOKEN_KEY: 'refreshToken',
  USER_KEY: 'user'
};

// 현재 환경 정보 출력
console.log(`현재 환경: ${NODE_ENV}`);
console.log(`API 서버 URL: ${API_BASE_URL}`);
console.log(`WebSocket URL: ${WS_BASE_URL}`);

export { API_BASE_URL, WS_BASE_URL, WS_ENDPOINT, NODE_ENV, IS_PRODUCTION, CONSTANTS };
