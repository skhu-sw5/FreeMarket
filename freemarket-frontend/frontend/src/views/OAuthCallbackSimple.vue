<template>
  <div class="oauth-callback">
    <div class="text-container">
      <h2>로그인 처리 중...</h2>
      <div class="spinner"></div>
      <p>잠시만 기다려주세요.</p>
    </div>
  </div>
</template>

<script>
// 환경에 관계없이 작동하는 OAuth 콜백 처리기
export default {
  name: 'OAuthCallbackSimple',
  mounted() {
    console.log('OAuth 콜백 처리 시작...');
    this.processCallback();
  },
  methods: {
    processCallback() {
      try {
        // 1. URL에서 토큰 추출
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('accessToken');
        const refreshToken = urlParams.get('refreshToken');
        
        console.log('토큰 확인:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });
        
        if (!accessToken || !refreshToken) {
          throw new Error('유효한 토큰을 찾을 수 없습니다.');
        }
        
        // 2. 토큰 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        console.log('토큰이 성공적으로 저장되었습니다.');
        
        // 3. 사용자 정보 저장을 위한 Vuex 스토어 업데이트 시도
        try {
          this.$store.commit('auth/setAuthTokens', { accessToken, refreshToken });
          console.log('Vuex 스토어 업데이트 완료');
        } catch (storeError) {
          console.warn('Vuex 스토어 업데이트 실패 (무시됨):', storeError);
        }
        
        // 4. 환경에 따른 적절한 홈 URL 결정 (운영/개발 환경 자동 감지)
        const isProduction = window.location.hostname !== 'localhost';
        let homeUrl = '/';
        
        // 저장된 리다이렉션 경로가 있으면 사용, 없으면 홈으로
        const redirectPath = localStorage.getItem('redirectPath');
        if (redirectPath) {
          homeUrl = redirectPath;
          localStorage.removeItem('redirectPath'); // 사용 후 삭제
        }
        
        // 5. 홈페이지로 리다이렉션
        console.log(`리다이렉션 ${isProduction ? '(운영 환경)' : '(개발 환경)'}: ${homeUrl}`);
        
        // Vue Router 사용
        this.$router.push(homeUrl);
        
        // 직접 URL 변경 (대비책)
        setTimeout(() => {
          if (window.location.pathname.includes('oauth/callback')) {
            console.log('Vue Router 리다이렉션이 실패했습니다. 직접 URL 변경을 시도합니다.');
            window.location.href = homeUrl;
          }
        }, 1000);
        
      } catch (error) {
        console.error('OAuth 콜백 처리 중 오류:', error.message);
        alert('로그인 처리 중 오류가 발생했습니다: ' + error.message);
        // 오류 발생 시 로그인 페이지로 리다이렉션
        this.$router.push('/login');
      }
    }
  }
}
</script>

<style scoped>
.oauth-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.text-container {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
</style>
