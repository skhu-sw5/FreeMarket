import axios from 'axios'
import store from '@/store'
import router from '@/router'
import { getBaseUrl } from '@/utils/environment'

// 환경에 맞는 API 기본 URL 설정
const apiBaseUrl = getBaseUrl();

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // 요청 타임아웃: 10초
});

// 디버깅 정보 (개발 환경에서만)
console.log(`API 클라이언트 초기화: ${apiBaseUrl}`);

// 요청 인터셉터 설정
apiClient.interceptors.request.use(
  config => {
    // 요청에 인증 토큰 추가
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    // 원본 요청 설정 저장
    const originalRequest = error.config;
    
    // 401 Unauthorized 에러이고 토큰 갱신 시도를 아직 하지 않은 경우
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 액세스 토큰 갱신 시도
        await store.dispatch('auth/refreshTokens');
        
        // 갱신된 토큰으로 원본 요청 재시도
        const token = localStorage.getItem('accessToken');
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 - 로그아웃 처리 후 로그인 페이지로 리다이렉트
        console.error('토큰 갱신 실패:', refreshError);
        await store.dispatch('auth/logout');
        router.push('/login');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
