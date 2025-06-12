import axios from 'axios';
import { API_BASE_URL, CONSTANTS } from '@/config';
import store from '@/store';
import router from '@/router';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 토큰이 있으면 헤더에 추가
    const token = store.state.auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 로딩 상태 시작
    store.dispatch('ui/setLoading', true);
    
    return config;
  },
  (error) => {
    store.dispatch('ui/setLoading', false);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    // 로딩 상태 종료
    store.dispatch('ui/setLoading', false);
    return response;
  },
  async (error) => {
    // 로딩 상태 종료
    store.dispatch('ui/setLoading', false);
    
    const originalRequest = error.config;
    
    // 401 오류이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 토큰 갱신 시도
        await store.dispatch('auth/refreshTokenAction');
        
        // 새 토큰으로 원래 요청 재시도
        const newToken = store.state.auth.token;
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        await store.dispatch('auth/logout');
        router.push('/login');
        return Promise.reject(refreshError);
      }
    }
    
    // 에러 메시지 처리
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        '네트워크 오류가 발생했습니다.';
    
    // 전역 에러 상태 업데이트
    store.dispatch('ui/setError', errorMessage);
    
    return Promise.reject(error);
  }
);

// 파일 업로드용 API 인스턴스
const fileApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 파일 업로드는 더 긴 타임아웃
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// 파일 업로드 요청 인터셉터
fileApi.interceptors.request.use(
  (config) => {
    const token = store.state.auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    store.dispatch('ui/setLoading', true);
    return config;
  },
  (error) => {
    store.dispatch('ui/setLoading', false);
    return Promise.reject(error);
  }
);

// 파일 업로드 응답 인터셉터
fileApi.interceptors.response.use(
  (response) => {
    store.dispatch('ui/setLoading', false);
    return response;
  },
  async (error) => {
    store.dispatch('ui/setLoading', false);
    
    // 401 오류 처리 (일반 API와 동일)
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await store.dispatch('auth/refreshTokenAction');
        const newToken = store.state.auth.token;
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return fileApi(originalRequest);
        }
      } catch (refreshError) {
        await store.dispatch('auth/logout');
        router.push('/login');
        return Promise.reject(refreshError);
      }
    }
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        '파일 업로드 중 오류가 발생했습니다.';
    
    store.dispatch('ui/setError', errorMessage);
    return Promise.reject(error);
  }
);

// API 응답 데이터 추출 헬퍼 함수
export const extractResponseData = (response) => {
  return response.data?.data || response.data;
};

// API 에러 메시지 추출 헬퍼 함수
export const extractErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.data?.message) {
    return error.response.data.data.message;
  }
  return error.message || '알 수 없는 오류가 발생했습니다.';
};

// HTTP 상태 코드 체크 헬퍼 함수
export const isSuccessResponse = (response) => {
  return response.status >= 200 && response.status < 300;
};

export { api, fileApi };
export default api;
