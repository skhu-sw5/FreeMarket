<template>
  <div class="oauth-callback">
    <div class="loading-container" v-if="status === 'loading'">
      <p>로그인 처리 중...</p>
      <div class="spinner"></div>
    </div>
    <div class="error-container" v-if="status === 'error'">
      <p>로그인 처리 중 문제가 발생했습니다:</p>
      <p>{{ error }}</p>
      <button @click="goToLogin" class="btn">로그인 페이지로 돌아가기</button>
    </div>
    <div class="debug-info" v-if="process.env.NODE_ENV === 'development'">
      <h3>디버그 정보:</h3>
      <pre>{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script>
import { 
  extractTokensFromUrl, 
  saveTokensToStorage, 
  getRedirectPath, 
  clearRedirectPath 
} from '@/utils/auth';

export default {
  name: 'OAuthCallback',
  data() {
    return {
      status: 'loading',
      error: null,
      debugInfo: null,
      process: process
    }
  },
  mounted() {
    this.processOAuthCallback();
  },
  methods: {
    processOAuthCallback() {
      console.log('OAuth 콜백 처리를 시작합니다...');
      
      try {
        // 1. URL에서 토큰 추출
        const { accessToken, refreshToken } = extractTokensFromUrl();
        
        // 디버깅용 정보
        this.debugInfo = {
          url: window.location.href,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        };
        
        console.log('토큰 추출 결과:', this.debugInfo);
        
        // 2. 토큰 유효성 검사
        if (!accessToken || !refreshToken) {
          throw new Error('인증 토큰이 없습니다. 다시 로그인해 주세요.');
        }
        
        // 3. 토큰 저장
        saveTokensToStorage(accessToken, refreshToken);
        console.log('토큰이 localStorage에 저장되었습니다.');
        
        // 4. 스토어 업데이트 시도
        try {
          this.$store.commit('auth/setAuthTokens', { accessToken, refreshToken });
          console.log('Vuex 스토어가 업데이트되었습니다.');
        } catch (storeError) {
          console.warn('Vuex 스토어 업데이트 실패:', storeError);
          // 스토어 업데이트 실패해도 계속 진행
        }
        
        // 5. 리다이렉션 경로 가져오기
        const redirectPath = getRedirectPath();
        clearRedirectPath();
        console.log('리다이렉션 경로:', redirectPath);
        
        // 6. 지연 후 리다이렉트 (브라우저 처리 시간 확보)
        setTimeout(() => {
          console.log('페이지 이동 시작...');
          // window.location.href = redirectPath; // 대안 1: 직접 URL 변경
          this.$router.push(redirectPath);       // 대안 2: Vue Router 사용
        }, 1000);
        
      } catch (error) {
        console.error('OAuth 콜백 처리 중 오류:', error);
        this.status = 'error';
        this.error = error.message || '로그인 처리 중 오류가 발생했습니다.';
      }
    },
    
    goToLogin() {
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.oauth-callback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  text-align: center;
  padding: 1rem;
}

.loading-container,
.error-container {
  max-width: 400px;
  padding: 2rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.debug-info {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f0f0f0;
  border-radius: 4px;
  text-align: left;
  max-width: 600px;
  overflow-x: auto;
}

.debug-info pre {
  margin: 0;
  white-space: pre-wrap;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 20px auto;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4299e1;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #3182ce;
}
</style>
