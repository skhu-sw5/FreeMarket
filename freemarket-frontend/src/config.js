// API 서버 기본 URL 설정
// 모든 환경에서 절대 URL 사용

// 개발 환경 상수 정의 (Vue CLI의 환경 변수 대신 사용)
const IS_PRODUCTION = true; // 항상 프로덕션 모드로 설정하여 절대 URL 사용
const NODE_ENV = IS_PRODUCTION ? 'production' : 'development';

const API_BASE_URL = 'https://freemarket.duckdns.org';  // 항상 전체 URL 사용

// 현재 환경 정보 출력
console.log(`현재 환경: ${NODE_ENV}`);
console.log(`API 서버 URL: ${API_BASE_URL}`);

export { API_BASE_URL, NODE_ENV };
