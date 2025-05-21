/**
 * 현재 환경이 개발 환경인지 운영 환경인지 판단하는 유틸리티 함수
 */

/**
 * 현재 환경이 개발 환경인지 확인
 * @returns {boolean} 개발 환경이면 true, 아니면 false
 */
export const isDevelopment = () => {
  // 방법 1: 호스트명으로 판단
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
  
  // 방법 2: 개발 환경 변수로 판단 (Vue CLI 사용 시)
  // return process.env.NODE_ENV === 'development';
};

/**
 * 현재 환경이 운영 환경인지 확인
 * @returns {boolean} 운영 환경이면 true, 아니면 false
 */
export const isProduction = () => {
  return !isDevelopment();
};

/**
 * 현재 환경에 맞는 베이스 URL 반환
 * @returns {string} 현재 환경에 맞는 백엔드 베이스 URL
 */
export const getBaseUrl = () => {
  return isDevelopment() 
    ? 'http://localhost:8080' // 개발 환경 백엔드 URL
    : 'https://freemarket.duckdns.org'; // 운영 환경 백엔드 URL
};

/**
 * 현재 환경에 맞는 프론트엔드 URL 반환
 * @returns {string} 현재 환경에 맞는 프론트엔드 베이스 URL
 */
export const getFrontendUrl = () => {
  return isDevelopment()
    ? 'http://localhost:8081' // 개발 환경 프론트엔드 URL
    : 'https://freemarket.duckdns.org'; // 운영 환경 프론트엔드 URL
};

/**
 * OAuth2 소셜 로그인 URL 생성
 * @param {string} provider 소셜 로그인 제공자 (google, kakao, naver 등)
 * @returns {string} 소셜 로그인 URL
 */
export const getOAuth2Url = (provider) => {
  return `${getBaseUrl()}/oauth2/authorization/${provider}`;
};
