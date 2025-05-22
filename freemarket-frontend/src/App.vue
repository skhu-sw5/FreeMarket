<template>
  <div class="min-h-screen flex flex-col">
    <router-view />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'App',
  
  computed: {
    ...mapState('auth', ['isAuthenticated', 'token', 'refreshToken'])
  },
  
  created() {
    // 로컬 스토리지에 토큰이 있는지 확인
    const token = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (token) {
      console.log('앱 로드: 토큰이 존재합니다.');
      
      // 토큰이 있으면 즉시 인증 상태를 true로 설정 (UI 반응성 향상)
      this.$store.commit('auth/SET_AUTH_TOKENS', {
        accessToken: token,
        refreshToken: refreshToken
      });
      
      // 사용자 정보 불러오기
      this.fetchUser()
        .then(user => {
          if (user) {
            console.log('사용자 정보 로드 성공:', user.name);
          } else {
            console.warn('사용자 정보 로드 실패. 토큰 갱신을 시도합니다.');
            this.tryRefreshToken();
          }
        })
        .catch(error => {
          console.error("사용자 정보 로딩 실패:", error);
          this.tryRefreshToken();
        });
    } else {
      console.log('앱 로드: 토큰이 없습니다.');
      // 토큰이 없으면 명시적으로 인증 상태를 false로 설정
      this.$store.commit('auth/CLEAR_AUTH');
    }
    
    // runtime.lastError 경고 숨기기
    this.suppressChromeExtensionErrors();
  },
  
  methods: {
    ...mapActions('auth', ['fetchUser', 'logout', 'refreshTokenAction']),
    
    tryRefreshToken() {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      
      // 리프레시 토큰이 있으면 자동 갱신 시도
      if (refreshTokenValue) {
        console.log('토큰 만료 감지: 리프레시 토큰으로 갱신 시도');
        this.refreshTokenAction()
          .then(() => {
            console.log('토큰 갱신 성공');
            return this.fetchUser(); // 다시 사용자 정보 가져오기
          })
          .catch(refreshError => {
            console.error('토큰 갱신 실패:', refreshError);
            // 현재 경로가 인증이 필요한 경로인지 확인
            const currentRoute = this.$router.currentRoute.value;
            if (currentRoute.meta && currentRoute.meta.requiresAuth) {
              console.log('인증이 필요한 페이지입니다. 로그인 페이지로 이동합니다.');
              this.$router.push('/login');
            }
          });
      } else {
        // 현재 경로가 인증이 필요한 경로인지 확인
        const currentRoute = this.$router.currentRoute.value;
        if (currentRoute.meta && currentRoute.meta.requiresAuth) {
          console.log('인증이 필요한 페이지입니다. 로그인 페이지로 이동합니다.');
          this.$router.push('/login');
        }
      }
    },
    
    suppressChromeExtensionErrors() {
      // 개발 환경에서만 확장 프로그램 오류 필터링
      if (process.env.NODE_ENV !== 'development') {
        return; // 프로덕션에서는 실행하지 않음
      }
      
      // 간단한 console.error 오버라이드
      const originalError = console.error;
      console.error = function(...args) {
        const message = args.join(' ').toLowerCase();
        
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
