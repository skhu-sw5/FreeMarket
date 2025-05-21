<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <AppHeader />
    
    <div class="flex-grow flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 class="text-2xl font-bold text-center mb-6">비밀번호 찾기</h1>
        
        <div v-if="submitted" class="text-center bg-blue-50 p-6 rounded-lg mb-4">
          <i class="fas fa-envelope-open-text text-4xl text-blue-500 mb-3"></i>
          <h2 class="text-xl font-semibold mb-2">이메일을 확인하세요</h2>
          <p class="text-gray-600 mb-4">
            {{ email }} 주소로 비밀번호 재설정 링크가 전송되었습니다.
            이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.
          </p>
          <p class="text-sm text-gray-500">
            이메일이 보이지 않나요? 스팸함을 확인하거나 몇 분 후에 다시 시도해보세요.
          </p>
        </div>
        
        <form v-else @submit.prevent="submitRequest" class="space-y-4">
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-gray-700">이메일 주소</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.email }"
              placeholder="가입했던 이메일 주소를 입력하세요"
            />
            <p v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</p>
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
              <span v-else>비밀번호 재설정 링크 받기</span>
            </button>
          </div>
          
          <div class="text-center mt-4">
            <router-link to="/login" class="text-sm text-blue-600 hover:text-blue-800">
              로그인 페이지로 돌아가기
            </router-link>
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
  name: 'PasswordResetRequest',
  
  components: {
    AppHeader,
    AppFooter
  },
  
  data() {
    return {
      email: '',
      errors: {},
      loading: false,
      submitted: false
    }
  },
  
  methods: {
    async submitRequest() {
      this.errors = {}
      this.loading = true
      
      try {
        // 이메일 유효성 검사
        if (!this.isValidEmail(this.email)) {
          this.errors.email = '유효한 이메일 주소를 입력해주세요.'
          return
        }
        
        // API 요청
        const response = await fetch('/api/auth/password/reset-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: this.email
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 404) {
            this.errors.email = '등록되지 않은 이메일 주소입니다.'
          } else {
            throw new Error(errorData.message || '서버 오류가 발생했습니다.')
          }
          return
        }
        
        // 성공 처리
        this.submitted = true
        
      } catch (error) {
        console.error('비밀번호 재설정 요청 오류:', error)
        this.$toast.error('비밀번호 재설정 요청에 실패했습니다.')
      } finally {
        this.loading = false
      }
    },
    
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }
  }
}
</script> 