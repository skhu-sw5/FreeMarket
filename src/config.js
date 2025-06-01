// API 서버 기본 URL 설정
// 환경에 따라 적절한 URL 사용

// 개발 환경 판단 (기본값은 개발 환경)
const IS_PRODUCTION = false; // 개발 환경에서는 false로 설정
const NODE_ENV = IS_PRODUCTION ? 'production' : 'development';

// 개발 환경에서는 상대 URL 사용 (프록시 설정 활용)
// 프로덕션 환경에서는 절대 URL 사용
const API_BASE_URL = IS_PRODUCTION
  ? 'https://freemarket.duckdns.org'
  : '';  // 개발 환경에서는 상대 경로 사용 (프록시 설정 활용)

// 현재 환경 정보 출력
console.log(`현재 환경: ${NODE_ENV}`);
console.log(`API 서버 URL: ${API_BASE_URL}`);

export { API_BASE_URL, NODE_ENV };
