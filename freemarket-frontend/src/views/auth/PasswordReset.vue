<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <AppHeader />
    
    <div class="flex-grow flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 class="text-2xl font-bold text-center mb-6">비밀번호 재설정</h1>
        
        <div v-if="resetCompleted" class="text-center bg-green-50 p-6 rounded-lg mb-4">
          <i class="fas fa-check-circle text-4xl text-green-500 mb-3"></i>
          <h2 class="text-xl font-semibold mb-2">비밀번호 재설정 완료</h2>
          <p class="text-gray-600 mb-4">
            비밀번호가 성공적으로 변경되었습니다.
            새 비밀번호로 로그인하세요.
          </p>
          <router-link 
            to="/login" 
            class="inline-block py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            로그인 페이지로 이동
          </router-link>
        </div>
        
        <div v-else-if="invalidToken" class="text-center bg-red-50 p-6 rounded-lg mb-4">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-3"></i>
          <h2 class="text-xl font-semibold mb-2">유효하지 않은 링크</h2>
          <p class="text-gray-600 mb-4">
            비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.
            다시 비밀번호 재설정을 요청해주세요.
          </p>
          <router-link 
            to="/password-reset-request" 
            class="inline-block py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            비밀번호 찾기
          </router-link>
        </div>
        
        <form v-else @submit.prevent="resetPassword" class="space-y-4">
          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-gray-700">새 비밀번호</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="new-password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.password }"
              placeholder="새로운 비밀번호를 입력하세요"
            />
            <p v-if="errors.password" class="text-red-500 text-sm">{{ errors.password }}</p>
          </div>
          
          <div class="space-y-2">
            <label for="passwordConfirm" class="block text-sm font-medium text-gray-700">비밀번호 확인</label>
            <input
              id="passwordConfirm"
              v-model="passwordConfirm"
              type="password"
              required
              autocomplete="new-password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.passwordConfirm }"
              placeholder="새로운 비밀번호를 다시 입력하세요"
            />
            <p v-if="errors.passwordConfirm" class="text-red-500 text-sm">{{ errors.passwordConfirm }}</p>
          </div>
          
          <div class="pt-2">
            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              :disabled="loading"
            >
              <span v-if="loading">
                <i class="fas fa-spinner fa-spin mr-2"></i>처리 중...
              </span>
              <span v-else>비밀번호 변경</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'

export default {
  name: 'PasswordReset',
  
  components: {
    AppHeader,
    AppFooter
  },
  
  data() {
    return {
      token: '',
      password: '',
      passwordConfirm: '',
      errors: {},
      loading: false,
      resetCompleted: false,
      invalidToken: false
    }
  },
  
  created() {
    // URL에서 토큰 추출
    this.token = this.$route.query.token
    
    // 토큰이 없으면 유효하지 않은 접근으로 간주
    if (!this.token) {
      this.invalidToken = true
    }
  },
  
  methods: {
    async resetPassword() {
      this.errors = {}
      
      // 비밀번호 유효성 검사
      if (this.password.length < 8) {
        this.errors.password = '비밀번호는 8자 이상이어야 합니다.'
        return
      }
      
      if (this.password !== this.passwordConfirm) {
        this.errors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
        return
      }
      
      this.loading = true
      
      try {
        const response = await fetch('/api/auth/password/reset-verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            token: this.token,
            newPassword: this.password
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          
          if (response.status === 400 || response.status === 404) {
            this.invalidToken = true
          } else {
            throw new Error(errorData.message || '서버 오류가 발생했습니다.')
          }
          return
        }
        
        // 성공 처리
        this.resetCompleted = true
        
      } catch (error) {
        console.error('비밀번호 재설정 오류:', error)
        this.$toast.error('비밀번호 재설정에 실패했습니다.')
      } finally {
        this.loading = false
      }
    }
  }
}
</script> 