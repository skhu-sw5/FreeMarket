<template>
  <div id="app" class="min-h-screen flex flex-col">
    <!-- 초기화 중 로딩 표시 -->
    <div v-if="!isInitialized" class="flex items-center justify-center min-h-screen bg-gray-50">
      <div class="flex flex-col items-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="text-gray-600">앱을 초기화하는 중...</p>
      </div>
    </div>
    
    <!-- 초기화 완료 후 메인 컨텐츠 -->
    <router-view v-else class="flex-1" />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'App',
  
  computed: {
    ...mapState('auth', ['isAuthenticated', 'isInitialized', 'token', 'refreshToken'])
  },
  
  async created() {
    console.log('🚀 App.vue 초기화 시작');
    
    try {
      const startTime = Date.now();
      
      // 토큰 유효성 검증 및 자동 로그인 시도
      const isValid = await this.validateToken();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (isValid) {
        console.log(`✅ 앱 초기화 완료: 자동 로그인 성공 (${duration}ms)`);
      } else {
        console.log(`✅ 앱 초기화 완료: 로그아웃 상태 (${duration}ms)`);
      }
      
      // 네트워크 상태 모니터링 설정
      this.setupNetworkMonitoring();
      
    } catch (error) {
      console.error('❌ 앱 초기화 중 오류:', error);
      // 오류 발생 시 안전하게 로그아웃 상태로 초기화
      this.$store.commit('auth/CLEAR_AUTH');
    }
    
    // runtime.lastError 경고 숨기기 (개발 환경)
    this.suppressChromeExtensionErrors();
  },
  
  methods: {
    ...mapActions('auth', ['validateToken', 'logout']),
    
    // 네트워크 상태 모니터링 설정
    setupNetworkMonitoring() {
      // 온라인/오프라인 상태 감지
      const handleOnline = () => {
        console.log('🌐 네트워크 연결됨');
        // 연결 복구 시 토큰 상태 재검증
        if (this.token && !this.isAuthenticated) {
          console.log('🔄 네트워크 복구 후 토큰 재검증');
          this.validateToken();
        }
      };
      
      const handleOffline = () => {
        console.log('📡 네트워크 연결 끊어짐');
      };
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      this.$options.beforeUnmount = () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    },
    
    suppressChromeExtensionErrors() {
      // 개발 환경에서만 확장 프로그램 오류 필터링
      if (process.env.NODE_ENV !== 'development') {
        return; // 프로덕션에서는 실행하지 않음
      }
      
      // 간단한 console.error 오버라이드
      const originalError = console.error;
      console.error = function(...args) {
        // args를 문자열로 안전하게 변환
        const message = args.map(arg => {
          if (typeof arg === 'string') return arg;
          if (typeof arg === 'object' && arg !== null) {
            try {
              return JSON.stringify(arg);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' ').toLowerCase();
        
        // 확장 프로그램 관련 오류만 필터링
        if (message.includes('unchecked runtime.lasterror') ||
            message.includes('message port closed') ||
            message.includes('extension context invalidated')) {
          return; // 출력하지 않음
        }
        
        // 실제 애플리케이션 오류는 출력
        originalError.apply(console, args);
      };
      
      console.info('🔇 Chrome extension error filtering enabled (dev mode)');
    }
  }
}
</script>

<style>
@import '@fortawesome/fontawesome-free/css/all.min.css';

:root {
  --primary-color: #3B82F6;
  --secondary-color: #4F46E5;
  --danger-color: #EF4444;
  --success-color: #10B981;
}

body {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* 트랜지션 효과 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s, opacity 0.3s;
}
.scale-enter,
.scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

/* 접근성 향상 */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01s !important;
    animation-duration: 0.01s !important;
  }
}
</style>
