<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <div class="text-center mb-8">
        <router-link to="/" class="text-3xl font-bold text-blue-600">FreeMarket</router-link>
        <h2 class="mt-4 text-xl font-bold text-gray-900">로그인</h2>
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">이메일</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="example@email.com"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">비밀번호</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="********"
          />
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="rememberMe"
              type="checkbox"
              class="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">자동 로그인</label>
          </div>
          
          <div class="text-sm">
            <router-link to="/password-reset-request" class="text-blue-600 hover:text-blue-500">
              비밀번호 찾기
            </router-link>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <span v-if="loading">로그인 중...</span>
            <span v-else>로그인</span>
          </button>
        </div>
      </form>
      
      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>
        
        <div class="mt-6 grid grid-cols-1 gap-3">
          <button
            type="button"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            @click="socialLogin('google')"
          >
            <i class="fab fa-google mr-2"></i>
            Google로 로그인
          </button>
          
          <button
            type="button"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            @click="socialLogin('kakao')"
          >
            <i class="fas fa-comment mr-2 text-yellow-500"></i>
            Kakao로 로그인
          </button>
          
          <button
            type="button"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            @click="socialLogin('naver')"
          >
            <span class="w-4 h-4 bg-green-500 text-white flex items-center justify-center rounded mr-2 text-xs">N</span>
            Naver로 로그인
          </button>
        </div>
      </div>
      
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-600">
          계정이 없으신가요?
          <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
            회원가입
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'LoginView',
  
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false,
      error: null
    }
  },
  
  computed: {
    ...mapState('auth', ['loading']),
    
    redirect() {
      return this.$route.query.redirect || '/'
    }
  },
  
  methods: {
    ...mapActions('auth', ['login']),
    
    async handleLogin() {
      try {
        console.log('로그인 시도...');
        const result = await this.login({
          email: this.email,
          password: this.password
        });
        
        console.log('로그인 성공!', result);
        
        // LocalStorage에 토큰이 저장되었는지 확인
        try {
          const token = localStorage.getItem('accessToken');
          console.log('저장된 토큰 확인:', token ? '토큰 있음' : '토큰 없음');
        } catch (e) {
          console.error('로컬 스토리지 확인 오류:', e);
        }
        
        // 리다이렉션
        this.$router.push(this.redirect);
      } catch (error) {
        let errorMessage = '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
        
        // 네트워크 오류 처리
        if (error.message.includes('서버에 연결할 수 없습니다') || 
            error.message.includes('Failed to fetch')) {
          errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.error = errorMessage;
        console.error('로그인 실패:', error);
        alert(this.error);
      }
    },
    
    socialLogin(provider) {
      // 현재 경로를 저장 (소셜 로그인 완료 후 리다이렉트용)
      const currentPath = this.$route.query.redirect || '/'
      localStorage.setItem('authRedirect', currentPath)

      // 백엔드 서버 URL 설정
      // 로컬 백엔드를 사용하는 경우 아래 주석을 해제하고 위 라인을 주석 처리
      const baseUrl = 'https://freemarket.duckdns.org'  // 프로덕션 서버
      // const baseUrl = 'http://localhost:8080'  // 로컬 서버 (필요시 사용)
      
      const authUrl = `${baseUrl}/oauth2/authorization/${provider}`
      
      console.log(`${provider} 소셜 로그인으로 이동: ${authUrl}`)
      console.log('현재 프론트엔드 위치:', window.location.href)
      console.log('백엔드 서버:', baseUrl)
      
      // 서버 접근 가능 여부 간단 테스트
      fetch(`${baseUrl}/actuator/health`, { method: 'GET', mode: 'no-cors' })
        .then(() => console.log('백엔드 서버 접근 가능'))
        .catch(() => console.warn('백엔드 서버 접근 불가능 - 확인 필요'))
      
      // 현재 창에서 직접 이동
      window.location.href = authUrl
    }
  }
}
</script>
