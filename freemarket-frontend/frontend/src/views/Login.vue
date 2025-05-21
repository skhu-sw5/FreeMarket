<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">로그인</h1>
      
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="email">이메일</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            class="form-control"
            placeholder="이메일 주소를 입력하세요"
          />
        </div>
        
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            class="form-control"
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '로그인 중...' : '로그인' }}
          </button>
          <div class="links">
            <router-link to="/signup">회원가입</router-link>
            <router-link to="/reset-password">비밀번호 찾기</router-link>
          </div>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
      
      <div class="social-login">
        <p class="divider">또는</p>
        
        <div class="social-buttons">
          <button @click="socialLogin('google')" class="btn-social btn-google">
            <img src="@/assets/google-icon.svg" alt="Google" class="social-icon" />
            Google로 시작하기
          </button>
          
          <button @click="socialLogin('kakao')" class="btn-social btn-kakao">
            <img src="@/assets/kakao-icon.svg" alt="Kakao" class="social-icon" />
            카카오로 시작하기
          </button>
          
          <button @click="socialLogin('naver')" class="btn-social btn-naver">
            <img src="@/assets/naver-icon.svg" alt="Naver" class="social-icon" />
            네이버로 시작하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: null
    }
  },
  methods: {
    async login() {
      this.loading = true;
      this.error = null;
      
      try {
        await this.$store.dispatch('auth/login', {
          email: this.email,
          password: this.password
        });
        
        // 로그인 성공 - 원래 가려던 페이지 또는 홈으로 리다이렉트
        const redirectPath = localStorage.getItem('redirectPath') || '/';
        localStorage.removeItem('redirectPath');
        this.$router.push(redirectPath);
      } catch (error) {
        // 로그인 실패 - 에러 메시지 표시
        if (error.response && error.response.data && error.response.data.message) {
          this.error = error.response.data.message;
        } else {
          this.error = '로그인에 실패했습니다. 다시 시도해주세요.';
        }
      } finally {
        this.loading = false;
      }
    },
    
    socialLogin(provider) {
      // 환경 유틸리티 가져오기
      import('@/utils/environment').then(env => {
        // 현재 환경에 맞는 OAuth2 URL 가져오기
        const oauth2Url = env.getOAuth2Url(provider);
        
        // 현재 URL 저장 (로그인 후 복귀를 위해)
        const redirectPath = this.$route.query.redirect || '/';
        localStorage.setItem('redirectPath', redirectPath);
        
        console.log(`소셜 로그인 시작: ${provider}, URL: ${oauth2Url}`);
        
        // 소셜 로그인 페이지로 리다이렉트
        window.location.href = oauth2Url;
      });
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background-color: #f8f9fa;
}

.login-card {
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-title {
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 600;
  color: #333;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  background-color: #4299e1;
  color: white;
}

.btn-primary:hover {
  background-color: #3182ce;
}

.btn-primary:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.links {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.links a {
  color: #4299e1;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fed7d7;
  color: #e53e3e;
  border-radius: 4px;
  font-size: 0.875rem;
}

.social-login {
  margin-top: 1.5rem;
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background-color: #ddd;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.social-icon {
  width: 20px;
  height: 20px;
  margin-right: 0.5rem;
}

.btn-google:hover {
  background-color: #f8f9fa;
}

.btn-kakao {
  background-color: #fee500;
  color: #000000;
  border-color: #fee500;
}

.btn-kakao:hover {
  background-color: #ffe900;
}

.btn-naver {
  background-color: #03c75a;
  color: white;
  border-color: #03c75a;
}

.btn-naver:hover {
  background-color: #02b350;
}
</style>
