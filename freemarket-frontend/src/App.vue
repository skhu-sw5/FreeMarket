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
    console.log('App.vue created - 초기화 시작');
    
    try {
      // 토큰 유효성 검증 (Storage에서 읽기 + 만료 시간 확인 + 서버 검증)
      const isValid = await this.validateToken();
      
      if (isValid) {
        console.log('앱 초기화 완료: 로그인 상태 유지');
      } else {
        console.log('앱 초기화 완료: 로그아웃 상태');
      }
    } catch (error) {
      console.error('앱 초기화 중 오류:', error);
      // 오류 발생 시 안전하게 로그아웃 상태로 초기화
      this.$store.commit('auth/CLEAR_AUTH');
    }
    
    // runtime.lastError 경고 숨기기
    this.suppressChromeExtensionErrors();
  },
  
  methods: {
    ...mapActions('auth', ['validateToken', 'logout']),
    
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
