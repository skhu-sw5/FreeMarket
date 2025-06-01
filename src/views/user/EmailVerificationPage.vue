<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <AppHeader />
    
    <main class="py-6 flex-grow">
      <div class="container mx-auto px-4">
        <!-- 여기서 h1 태그를 제거하여 중복 제목을 제거합니다 -->
        
        <div class="max-w-2xl mx-auto">
          <EmailVerification />
        </div>
      </div>
    </main>
    
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';
import EmailVerification from '@/components/user/EmailVerification.vue';

export default {
  name: 'EmailVerificationPage',
  
  components: {
    AppHeader,
    AppFooter,
    EmailVerification
  },
  
  // 이메일 인증 페이지에서 나갈 때 사용자 정보 강제 갱신
  beforeRouteLeave(to, from, next) {
    // 프로필 페이지로 이동하는 경우에만 처리
    if (to.path === '/profile') {
      console.log('이메일 인증 페이지에서 프로필로 이동합니다. 사용자 정보를 새로고침합니다.');
      this.$store.dispatch('auth/fetchUser')
        .then(() => {
          next();
        })
        .catch(() => {
          // 오류가 발생해도 이동은 허용
          next();
        });
    } else {
      next();
    }
  }
};
</script>
