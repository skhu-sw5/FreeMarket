/**
 * 인증 관련 유틸리티 함수들
 */

/**
 * JWT 토큰이 만료되었는지 확인
 * @param {string} token - JWT 토큰
 * @returns {boolean} - 만료되었으면 true, 아니면 false
 */
export function isTokenExpired(token) {
  if (!token) return true;
  
  try {
    // JWT 토큰의 페이로드 부분을 디코딩
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // exp 클레임 확인 (만료 시간, 초 단위)
    if (!payload.exp) {
      console.warn('토큰에 만료 시간 정보가 없습니다.');
      return false; // 만료 시간이 없으면 유효한 것으로 처리
    }
    
    // 현재 시간과 비교 (5초 여유분 추가)
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < (currentTime + 5);
    
    if (isExpired) {
      console.log('토큰이 만료되었습니다:', new Date(payload.exp * 1000));
    }
    
    return isExpired;
  } catch (error) {
    console.error('토큰 디코딩 오류:', error);
    return true; // 디코딩 실패하면 만료된 것으로 처리
  }
}

/**
 * JWT 토큰에서 사용자 정보 추출
 * @param {string} token - JWT 토큰
 * @returns {object|null} - 사용자 정보 또는 null
 */
export function decodeToken(token) {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.userId,
      email: payload.sub,
      exp: payload.exp,
      iat: payload.iat
    };
  } catch (error) {
    console.error('토큰 디코딩 오류:', error);
    return null;
  }
}

/**
 * Storage에서 토큰을 안전하게 가져오기
 * @param {string} key - 저장소 키
 * @returns {string|null} - 토큰 또는 null
 */
export function getTokenFromStorage(key) {
  try {
    // localStorage 먼저 확인
    const localToken = localStorage.getItem(key);
    if (localToken && !isTokenExpired(localToken)) {
      return localToken;
    }
    
    // sessionStorage 확인
    const sessionToken = sessionStorage.getItem(key);
    if (sessionToken && !isTokenExpired(sessionToken)) {
      return sessionToken;
    }
    
    // 만료된 토큰이면 제거
    if (localToken) {
      localStorage.removeItem(key);
      console.log('만료된 토큰을 localStorage에서 제거했습니다.');
    }
    if (sessionToken) {
      sessionStorage.removeItem(key);
      console.log('만료된 토큰을 sessionStorage에서 제거했습니다.');
    }
    
    return null;
  } catch (error) {
    console.error('Storage에서 토큰 읽기 오류:', error);
    return null;
  }
}

/**
 * 토큰을 안전하게 Storage에 저장
 * @param {string} key - 저장소 키
 * @param {string} token - 저장할 토큰
 * @param {boolean} rememberMe - localStorage 사용 여부
 */
export function setTokenToStorage(key, token, rememberMe = false) {
  try {
    if (rememberMe) {
      localStorage.setItem(key, token);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, token);
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Storage에 토큰 저장 오류:', error);
  }
}

/**
 * 모든 Storage에서 토큰 제거
 * @param {string} key - 저장소 키
 */
export function removeTokenFromStorage(key) {
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Storage에서 토큰 제거 오류:', error);
  }
}

/**
 * 토큰의 남은 유효 시간 (분 단위)
 * @param {string} token - JWT 토큰
 * @returns {number} - 남은 시간 (분), 만료되었으면 0
 */
export function getTokenRemainingTime(token) {
  if (!token) return 0;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingSeconds = payload.exp - currentTime;
    
    return Math.max(0, Math.floor(remainingSeconds / 60));
  } catch (error) {
    console.error('토큰 시간 계산 오류:', error);
    return 0;
  }
}
