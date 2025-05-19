<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <div class="text-center mb-8">
        <router-link to="/" class="text-3xl font-bold text-blue-600">FreeMarket</router-link>
        <h2 class="mt-4 text-xl font-bold text-gray-900">회원가입</h2>
      </div>
      
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">이메일</label>
          <input
            id="email"
            v-model="user.email"
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
            v-model="user.password"
            type="password"
            required
            minlength="8"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="최소 8자 이상"
          />
          <p class="mt-1 text-xs text-gray-500">8자 이상의 비밀번호를 입력해주세요.</p>
        </div>
        
        <div>
          <label for="password-confirm" class="block text-sm font-medium text-gray-700">비밀번호 확인</label>
          <input
            id="password-confirm"
            v-model="passwordConfirm"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="비밀번호 재입력"
          />
          <p v-if="passwordMismatch" class="mt-1 text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
        </div>
        
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">이름</label>
          <input
            id="name"
            v-model="user.name"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="홍길동"
          />
        </div>
        
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700">휴대폰 번호</label>
          <input
            id="phone"
            v-model="user.phone"
            type="tel"
            required
            pattern="^01(?:0|1|[6-9])[.-]?(\d{3}|\d{4})[.-]?(\d{4})$"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="010-1234-5678"
          />
          <p class="mt-1 text-xs text-gray-500">'-' 포함 휴대폰 번호를 입력해주세요.</p>
        </div>
        
        <div class="mt-6">
          <button
            type="submit"
            :disabled="loading || passwordMismatch"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <span v-if="loading">처리 중...</span>
            <span v-else>회원가입</span>
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
            Google로 회원가입
          </button>
          
          <button
            type="button"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            @click="socialLogin('kakao')"
          >
            <i class="fas fa-comment mr-2 text-yellow-500"></i>
            Kakao로 회원가입
          </button>
          
          <button
            type="button"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            @click="socialLogin('naver')"
          >
            <span class="w-4 h-4 bg-green-500 text-white flex items-center justify-center rounded mr-2 text-xs">N</span>
            Naver로 회원가입
          </button>
        </div>
      </div>
      
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-600">
          이미 계정이 있으신가요?
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            로그인
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'RegisterView',
  
  data() {
    return {
      user: {
        email: '',
        password: '',
        name: '',
        phone: ''
      },
      passwordConfirm: '',
      error: null
    }
  },
  
  computed: {
    ...mapState('auth', ['loading']),
    
    passwordMismatch() {
      return this.user.password && this.passwordConfirm && this.user.password !== this.passwordConfirm
    }
  },
  
  methods: {
    ...mapActions('auth', ['register', 'login']),
    
    async handleRegister() {
      if (this.passwordMismatch) {
        return
      }
      
      try {
        // 회원가입 처리
        const registerResult = await this.register(this.user)
        console.log('회원가입 성공:', registerResult)
        
        // 회원가입 성공 시 자동 로그인 시도
        try {
          await this.login({
            email: this.user.email,
            password: this.user.password
          })
          
          // 홈 페이지로 이동
          this.$router.replace('/')
        } catch (loginError) {
          console.error('자동 로그인 실패:', loginError)
          // 로그인에 실패하더라도 로그인 페이지로 이동
          alert('회원가입은 성공했지만 자동 로그인에 실패했습니다. 로그인 페이지로 이동합니다.')
          this.$router.replace('/login')
        }
      } catch (error) {
        let errorMessage = '회원가입에 실패했습니다. 다시 시도해주세요.'
        
        // 네트워크 오류 처리
        if (error.message.includes('서버에 연결할 수 없습니다') || 
            error.message.includes('Failed to fetch')) {
          errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'
        } else if (error.message) {
          errorMessage = error.message
        }
        
        this.error = errorMessage
        console.error('회원가입 실패:', error)
        alert(this.error)
      }
    },
    
    socialLogin(provider) {
      // 소셜 로그인 URL 생성 (회원가입 목적)
      const redirectUri = encodeURIComponent(window.location.origin + '/oauth/callback')
      window.location.href = `https://freemarket.duckdns.org/oauth2/authorization/${provider}?redirect_uri=${redirectUri}`
    }
  }
}
</script>
