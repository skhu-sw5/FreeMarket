// 인증 관련 유틸리티 함수

/**
 * URL 쿼리 파라미터에서 토큰을 추출하는 함수
 * @returns {{accessToken: string|null, refreshToken: string|null}}
 */
export const extractTokensFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    accessToken: urlParams.get('accessToken'),
    refreshToken: urlParams.get('refreshToken')
  };
};

/**
 * 토큰을 localStorage에 저장하는 함수
 * @param {string} accessToken - JWT 액세스 토큰
 * @param {string} refreshToken - JWT 리프레시 토큰
 */
export const saveTokensToStorage = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  }
  
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

/**
 * localStorage에서 토큰을 가져오는 함수
 * @returns {{accessToken: string|null, refreshToken: string|null}}
 */
export const getTokensFromStorage = () => {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken')
  };
};

/**
 * localStorage에서 토큰을 제거하는 함수
 */
export const removeTokensFromStorage = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/**
 * 사용자가 인증되었는지 확인하는 함수
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken');
};

/**
 * 리다이렉션 경로를 관리하는 함수들
 */
export const setRedirectPath = (path) => {
  localStorage.setItem('redirectPath', path);
};

export const getRedirectPath = () => {
  return localStorage.getItem('redirectPath') || '/';
};

export const clearRedirectPath = () => {
  localStorage.removeItem('redirectPath');
};
