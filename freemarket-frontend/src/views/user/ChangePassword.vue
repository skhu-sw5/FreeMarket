<template>
  <div class="min-h-screen bg-gray-50 dark:bg-background-dark flex flex-col transition-colors duration-300">
    <AppHeader />
    
    <main class="py-6 flex-grow">
      <div class="container mx-auto px-4">
        <h1 class="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">비밀번호 변경</h1>
        
        <div class="card mb-6">
          <form @submit.prevent="changePassword">
            <div class="space-y-4">
              <div class="form-group">
                <label class="form-label" for="currentPassword">현재 비밀번호</label>
                <input 
                  type="password" 
                  id="currentPassword" 
                  v-model="form.currentPassword" 
                  class="input"
                  required
                />
                <p v-if="errors.currentPassword" class="mt-1 text-sm text-red-600">{{ errors.currentPassword }}</p>
              </div>
              
              <div class="form-group">
                <label class="form-label" for="newPassword">새 비밀번호</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  v-model="form.newPassword" 
                  class="input"
                  required
                  minlength="8"
                />
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">최소 8자 이상이어야 합니다.</p>
                <p v-if="errors.newPassword" class="mt-1 text-sm text-red-600">{{ errors.newPassword }}</p>
              </div>
              
              <div class="form-group">
                <label class="form-label" for="confirmPassword">새 비밀번호 확인</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  v-model="form.confirmPassword" 
                  class="input"
                  required
                />
                <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
              </div>
              
              <div class="flex space-x-4">
                <button 
                  type="submit" 
                  class="button-primary"
                  :disabled="loading"
                >
                  <span v-if="loading">변경 중...</span>
                  <span v-else>비밀번호 변경</span>
                </button>
                <router-link 
                  to="/profile" 
                  class="button-outline"
                >
                  취소
                </router-link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
    
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import { mapState } from 'vuex'
import { apiPost } from '@/utils/api'

export default {
  name: 'ChangePasswordView',
  
  components: {
    AppHeader,
    AppFooter
  },
  
  data() {
    return {
      form: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      errors: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      loading: false,
      success: false
    }
  },
  
  computed: {
    ...mapState('auth', ['user'])
  },
  
  methods: {
    validateForm() {
      let isValid = true
      this.errors = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      
      if (!this.form.currentPassword) {
        this.errors.currentPassword = '현재 비밀번호를 입력해주세요.'
        isValid = false
      }
      
      if (!this.form.newPassword) {
        this.errors.newPassword = '새 비밀번호를 입력해주세요.'
        isValid = false
      } else if (this.form.newPassword.length < 8) {
        this.errors.newPassword = '비밀번호는 최소 8자 이상이어야 합니다.'
        isValid = false
      }
      
      if (this.form.newPassword !== this.form.confirmPassword) {
        this.errors.confirmPassword = '비밀번호가 일치하지 않습니다.'
        isValid = false
      }
      
      return isValid
    },
    
    async changePassword() {
      if (!this.validateForm()) {
        return
      }
      
      this.loading = true
      
      try {
        const response = await apiPost('/api/users/me/password', {
          currentPassword: this.form.currentPassword,
          newPassword: this.form.newPassword
        })
        
        alert('비밀번호가 성공적으로 변경되었습니다.')
        this.$router.push('/profile')
      } catch (error) {
        console.error('비밀번호 변경 오류:', error)
        
        if (error.response && error.response.status === 400) {
          // 현재 비밀번호가 일치하지 않는 경우
          this.errors.currentPassword = '현재 비밀번호가 일치하지 않습니다.'
        } else {
          alert('비밀번호 변경 중 오류가 발생했습니다. 다시 시도해 주세요.')
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
