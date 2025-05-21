
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          로그인 처리 중...
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          인증이 완료되면 자동으로 이동합니다.
        </p>
        
        <!-- 디버깅 정보 표시 -->
        <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          <p class="font-bold">오류 발생:</p>
          <p>{{ error }}</p>
        </div>
        
        <div v-if="debugInfo" class="mt-4 p-4 bg-blue-100 text-blue-700 rounded-md text-left">
          <p class="font-bold">디버깅 정보:</p>
          <pre class="text-xs overflow-auto">{{ debugInfo }}</pre>
        </div>
        
        <!-- 수동 홈 이동 버튼 -->
        <div v-if="showHomeButton" class="mt-6">
          <button 
            @click="goToHome" 
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            홈으로 이동
          </button>
        </div>
        
        <!-- 로딩 스피너 -->
        <div class="mt-8 flex justify-center" v-if="loading">
          <svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'OAuthCallback',
  
  data() {
    return {
      loading: true,
      error: null,
      debugInfo: null,
      showHomeButton: false,
      accessToken: null,
      refreshToken: null
    }
  },
  
  mounted() {
    console.log('OAuthCallback 컴포넌트가 마운트되었습니다.');
    this.processCallback();
    
    // 5초 후에 수동 버튼 표시
    setTimeout(() => {
      this.showHomeButton = true;
      this.loading = false;
    }, 5000);
  },
  
  methods: {
    ...mapActions('auth', ['setAuth']),
    
    processCallback() {
      try {
        console.log('processCallback 메서드 실행');
        
        // URL 확인
        const currentUrl = window.location.href;
        console.log('현재 URL:', currentUrl);
        
        // URL에서 토큰 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        this.accessToken = urlParams.get('accessToken');
        this.refreshToken = urlParams.get('refreshToken');
        
        // 디버깅 정보 설정
        this.debugInfo = JSON.stringify({
          currentUrl,
          accessToken: this.accessToken ? this.accessToken.substring(0, 20) + '...' : null,
          refreshToken: this.refreshToken ? this.refreshToken.substring(0, 20) + '...' : null,
          urlParams: Object.fromEntries(urlParams.entries())
        }, null, 2);
        
        console.log('토큰 정보:', this.accessToken ? '토큰 있음' : '토큰 없음', this.refreshToken ? '리프레시 토큰 있음' : '리프레시 토큰 없음');
        
        if (this.accessToken && this.refreshToken) {
          // 토큰 저장
          localStorage.setItem('accessToken', this.accessToken);
          localStorage.setItem('refreshToken', this.refreshToken);
          console.log('로컬 스토리지에 토큰 저장 완료');
          
          // Vuex 스토어 상태 업데이트
          this.setAuth({ 
            accessToken: this.accessToken, 
            refreshToken: this.refreshToken 
          }).then(() => {
            console.log('Vuex 스토어 업데이트 성공');
            
            // 리다이렉트 경로 확인
            const redirectPath = localStorage.getItem('authRedirect') || '/';
            localStorage.removeItem('authRedirect'); // 사용 후 제거
            
            console.log('리다이렉트 경로:', redirectPath);
            
            // 리다이렉트
            setTimeout(() => {
              this.$router.push(redirectPath);
              console.log('리다이렉트 완료');
            }, 1000);
          }).catch(error => {
            console.error('Vuex 스토어 업데이트 실패:', error);
            this.error = '인증 상태 업데이트 중 오류: ' + error.message;
          });
        } else {
          // 토큰이 없으면 오류 처리
          this.error = '인증 토큰을 받지 못했습니다.';
          console.error('OAuth 콜백 오류: 토큰 없음');
        }
      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        this.error = '인증 처리 중 오류가 발생했습니다: ' + error.message;
      } finally {
        // 로딩 상태 업데이트
        this.loading = false;
      }
    },
    
    goToHome() {
      // 홈으로 이동 버튼 클릭 시 실행
      if (this.accessToken && this.refreshToken) {
        // 토큰이 있으면 저장 재시도
        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('refreshToken', this.refreshToken);
        
        try {
          // Vuex 스토어 상태 업데이트 재시도
          this.setAuth({ 
            accessToken: this.accessToken, 
            refreshToken: this.refreshToken 
          });
        } catch (error) {
          console.error('Vuex 상태 업데이트 재시도 실패:', error);
        }
      }
      
      // 홈으로 이동
      window.location.href = '/';
    }
  }
}
</script>

