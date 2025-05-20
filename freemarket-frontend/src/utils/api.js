import store from '@/store'
import { API_BASE_URL, NODE_ENV } from '@/config'

/**
 * API 요청을 수행하고, 필요 시 토큰을 자동 갱신하는 함수
 * @param {string} url - 요청 URL
 * @param {Object} options - fetch 옵션
 * @param {boolean} retry - 토큰 갱신 후 재시도 여부 (무한 루프 방지)
 * @returns {Promise<Object>} - 응답 데이터 
 */
export async function apiRequest(url, options = {}, retry = true) {
  // 인증 토큰 가져오기
  const token = store.state.auth.token
  
  // URL에 기본 URL 추가 (이미 절대 URL이면 그대로 사용)
  const fullUrl = url.startsWith('http') 
    ? url 
    : `${API_BASE_URL}${url}`
  
  // 기본 헤더 설정
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers
  }
  
  // 토큰이 있으면 Authorization 헤더 추가
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  // 최종 요청 옵션
  const requestOptions = {
    ...options,
    headers,
    credentials: 'include'
  }
  
  try {
    const response = await fetch(fullUrl, requestOptions)
    
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
      
      // 401 Unauthorized - 토큰 만료
      if (response.status === 401 && retry) {
        console.log('API 요청 401 응답: 토큰 갱신 시도')
        
        try {
          // 토큰 갱신 시도
          await store.dispatch('auth/refreshToken')
          
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
 */
export function apiGet(url, options = {}) {
  return apiRequest(url, { ...options, method: 'GET' })
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
