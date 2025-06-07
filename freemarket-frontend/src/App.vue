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
    <div v-else class="flex flex-col min-h-screen">
      <div class="flex-1">
        <router-view />
      </div>
      <AppFooter class="mt-auto" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import AppFooter from '@/components/common/AppFooter.vue';

export default {
  name: 'App',
  components: {
    AppFooter
  },
  
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
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 스크롤바 스타일링 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* 전역 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 버튼 전환 효과 */
.btn-transition {
  transition: all 0.2s ease-in-out;
}

/* 반응형 이미지 */
.img-responsive {
  max-width: 100%;
  height: auto;
  display: block;
}

/* 로딩 애니메이션 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 접근성을 위한 스크린 리더 전용 텍스트 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* 인풋 포커스 스타일 */
input:focus,
select:focus,
textarea:focus,
button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  transition: box-shadow 0.2s ease-in-out;
}

/* 다크 모드 대응을 위한 기본 색상 설정 */
@media (prefers-color-scheme: dark) {
  :root {
    --primary-color: #60A5FA;
    --secondary-color: #818CF8;
    --danger-color: #F87171;
    --success-color: #34D399;
  }
  
  body {
    background-color: #111827;
    color: #F3F4F6;
  }
  
  /* 다크 모드에서의 스크롤바 스타일 */
  ::-webkit-scrollbar-track {
    background: #1F2937;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #4B5563;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #6B7280;
  }
}

/* 푸터 고정 */
#app > div:last-child {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#app > div:last-child > div:first-child {
  flex: 1;
}

#app > div:last-child > div:last-child {
  margin-top: auto;
}
</style>
