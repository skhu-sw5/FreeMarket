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
    ...mapState('auth', ['isAuthenticated', 'token'])
  },
  
  created() {
    // 앱 로드 시 localStorage 토큰 유효성 검사
    if (this.isAuthenticated && this.token) {
      console.log('앱 로드: 로그인되어 있습니다. 사용자 정보를 불러옵니다.');
      
      this.fetchUser()
        .then(user => {
          if (user) {
            console.log('사용자 정보 로드 성공:', user.name);
          } else {
            console.warn('사용자 정보 로드 실패. 인증 정보가 유효하지 않을 수 있습니다.');
            
            // 현재 경로가 인증이 필요한 경로인지 확인
            const currentRoute = this.$router.currentRoute.value;
            if (currentRoute.meta && currentRoute.meta.requiresAuth) {
              console.log('인증이 필요한 페이지입니다. 로그인 페이지로 이동합니다.');
              this.$router.push('/login');
            }
          }
        })
        .catch(error => {
          console.error("앱 초기화 중 사용자 정보 로딩 실패:", error);
          
          // 현재 인증이 필요한 페이지인 경우에만 로그인으로 리다이렉트
          const currentRoute = this.$router.currentRoute.value;
          if (currentRoute.meta && currentRoute.meta.requiresAuth) {
            console.log('인증 오류로 로그인 페이지로 이동합니다.');
            this.$router.push('/login');
          }
        });
    } else {
      console.log('앱 로드: 로그인 상태가 아닙니다.');
    }
  },
  
  methods: {
    ...mapActions('auth', ['fetchUser', 'logout'])
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
