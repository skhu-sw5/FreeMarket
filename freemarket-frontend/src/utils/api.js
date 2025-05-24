import store from '@/store'
import { API_BASE_URL, NODE_ENV } from '@/config'

/**
 * API 요청을 수행하고, 필요 시 토큰을 자동 갱신하는 함수
 * @param {string} url - 요청 URL
 * @param {Object} options - fetch 옵션
 * @param {boolean} retry - 토큰 갱신 후 재시도 여부 (무한 루프 방지)
 * @param {boolean} skipViewCount - 조회수 증가를 건너뛸지 여부 (상품 상세 조회 시)
 * @returns {Promise<Object>} - 응답 데이터 
 */
export async function apiRequest(url, options = {}, retry = true) {
  // URL에 skipViewIncrement 파라미터 추가 (이미 있으면 그대로 유지)
  if (options.skipViewIncrement === true && !url.includes('skipViewIncrement=true')) {
    url += url.includes('?') ? '&skipViewIncrement=true' : '?skipViewIncrement=true';
    console.log('API 요청에 조회수 증가 건너뛰기 파라미터 추가:', url);
  }

  // 인증 토큰 가져오기
  const token = store.state.auth.token
  
  // URL에 기본 URL 추가 (이미 절대 URL이면 그대로 사용)
  const apiUrl = url.startsWith('http') 
    ? url 
    : `${API_BASE_URL}${url}`
  
  // 기본 헤더 설정
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers
  }
  
  // 인증이 필요 없는 엔드포인트인지 확인
  const authNotRequiredEndpoints = [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/refresh',
    '/api/auth/password/reset-request',
    '/api/auth/password/reset-verify'
  ];
  
  const needsAuth = !authNotRequiredEndpoints.some(endpoint => url.includes(endpoint));
  
  // 토큰이 있고 인증이 필요한 요청인 경우에만 Authorization 헤더 추가
  if (token && needsAuth && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  // 최종 요청 옵션
  const requestOptions = {
    ...options,
    headers,
    credentials: 'include'
  }
  
  try {
    const response = await fetch(apiUrl, requestOptions)
    
    // 응답 처리
    if (!response.ok) {
      // 사용자 정의 오류 처리기가 있으면 사용
      if (options.handleError && typeof options.handleError === 'function') {
        const shouldThrow = options.handleError(response.status, response);
        // false를 반환하면 오류를 발생시키지 않고 빈 객체 반환
        if (shouldThrow === false) {
          console.log(`응답 상태 ${response.status}에 대한 커스텀 처리: 오류 무시`);
          return { success: false, data: null };
        }
      }
      
      // 401 Unauthorized - 토큰 만료 (인증이 필요한 요청에서만)
      if (response.status === 401 && retry && needsAuth && !options.skipAuth) {
        console.log('API 요청 401 응답: 토큰 갱신 시도')
        
        // 현재 리프레시 중인지 확인
        if (store.state.auth.isRefreshing) {
          console.log('이미 토큰 리프레시 중입니다. 기존 요청을 기다립니다.');
          try {
            await store.state.auth.refreshPromise;
            // 리프레시 완료 후 재시도
            return apiRequest(url, options, false);
          } catch (refreshError) {
            console.error('토큰 갱신 대기 중 오류:', refreshError);
            throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
          }
        }
        
        try {
          // 토큰 갱신 시도
          await store.dispatch('auth/refreshTokenAction')
          
          // 토큰 갱신 성공 시, 원래 요청 재시도 (재귀적으로 호출하되, retry=false로 설정하여 무한 루프 방지)
          return apiRequest(url, options, false)
        } catch (refreshError) {
          console.error('토큰 갱신 실패:', refreshError)
          // 토큰 갱신 실패 - 로그인 페이지로 리다이렉트할 수 있음
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.')
        }
      }
      
      // 다른 HTTP 오류
      const errorMessage = await extractErrorMessage(response)
      throw new Error(errorMessage)
    }
    
    // 성공 응답 처리
    return await response.json()
  } catch (error) {
    // 네트워크 오류 처리
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
    }
    
    // 그 외 오류는 그대로 전달
    throw error
  }
}

/**
 * 오류 응답에서 메시지 추출
 */
async function extractErrorMessage(response) {
  try {
    const errorData = await response.json()
    return errorData.message || `요청 실패: ${response.status} ${response.statusText}`
  } catch (e) {
    // JSON 파싱 실패 시
    return `요청 실패: ${response.status} ${response.statusText}`
  }
}

/**
 * GET 요청 도우미 함수
 * @param {string} url - 요청 URL
 * @param {Object} options - 요청 옵션
 * @param {boolean} skipViewCount - 조회수 증가를 건너뛸지 여부 (true면 조회수 증가하지 않음)
 */
export function apiGet(url, options = {}) {
  // skipViewIncrement 옵션을 기본 GET 옵션에 추가
  return apiRequest(url, { 
    ...options, 
    method: 'GET',
    skipViewIncrement: options.skipViewIncrement || store.state.products?.skipViewIncrement
  });
}

/**
 * POST 요청 도우미 함수
 */
export function apiPost(url, data, options = {}) {
  return apiRequest(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * PUT 요청 도우미 함수
 */
export function apiPut(url, data, options = {}) {
  return apiRequest(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

/**
 * PATCH 요청 도우미 함수
 */
export function apiPatch(url, data, options = {}) {
  return apiRequest(url, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data)
  })
}

/**
 * DELETE 요청 도우미 함수
 */
export function apiDelete(url, options = {}) {
  return apiRequest(url, { ...options, method: 'DELETE' })
}
