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
    
    // 현재 시간과 비교 (30초 여유분 추가)
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < (currentTime + 30);
    
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
 * Storage에서 토큰을 안전하게 가져오기 (자동 로그인 지원)
 * @param {string} key - 저장소 키
 * @returns {string|null} - 토큰 또는 null
 */
export function getTokenFromStorage(key) {
  try {
    // localStorage 먼저 확인 (자동 로그인용 - "자동 로그인" 체크한 경우)
    const localToken = localStorage.getItem(key);
    if (localToken) {
      // 만료되지 않은 토큰이면 반환
      if (!isTokenExpired(localToken)) {
        console.log(`🔐 자동 로그인: localStorage에서 유효한 ${key} 토큰 발견`);
        return localToken;
      } else {
        // 만료된 토큰 제거
        localStorage.removeItem(key);
        console.log(`🗑️ 만료된 ${key} 토큰을 localStorage에서 제거했습니다.`);
      }
    }
    
    // sessionStorage 확인 (일반 로그인용)
    const sessionToken = sessionStorage.getItem(key);
    if (sessionToken) {
      // 만료되지 않은 토큰이면 반환
      if (!isTokenExpired(sessionToken)) {
        console.log(`🔐 세션: sessionStorage에서 유효한 ${key} 토큰 발견`);
        return sessionToken;
      } else {
        // 만료된 토큰 제거
        sessionStorage.removeItem(key);
        console.log(`🗑️ 만료된 ${key} 토큰을 sessionStorage에서 제거했습니다.`);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Storage에서 토큰 읽기 오류:', error);
    return null;
  }
}

/**
 * 토큰을 안전하게 Storage에 저장 (자동 로그인 지원)
 * @param {string} key - 저장소 키
 * @param {string} token - 저장할 토큰
 * @param {boolean} rememberMe - 자동 로그인 옵션 (localStorage 사용 여부)
 */
export function setTokenToStorage(key, token, rememberMe = false) {
  try {
    if (rememberMe) {
      // 자동 로그인 체크한 경우: localStorage에 저장
      localStorage.setItem(key, token);
      sessionStorage.removeItem(key); // 세션 스토리지에서는 제거
      console.log(`💾 자동 로그인: ${key} 토큰을 localStorage에 저장`);
    } else {
      // 일반 로그인: sessionStorage에 저장
      sessionStorage.setItem(key, token);
      localStorage.removeItem(key); // 로컬 스토리지에서는 제거
      console.log(`💾 세션 로그인: ${key} 토큰을 sessionStorage에 저장`);
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
 * 자동 로그인 상태 확인
 * @returns {boolean} - localStorage에 토큰이 있으면 true (자동 로그인 활성화됨)
 */
export function isAutoLoginEnabled() {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    // 하나라도 localStorage에 있으면 자동 로그인이 활성화된 것
    return !!(accessToken || refreshToken);
  } catch (error) {
    console.error('자동 로그인 상태 확인 오류:', error);
    return false;
  }
}

/**
 * 자동 로그인 해제 (localStorage의 토큰만 제거)
 */
export function disableAutoLogin() {
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    console.log('🔓 자동 로그인이 해제되었습니다.');
  } catch (error) {
    console.error('자동 로그인 해제 오류:', error);
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
