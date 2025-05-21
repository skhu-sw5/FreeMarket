<template>
  <div id="app">
    <nav v-if="!isCallbackRoute" class="navbar">
      <div class="container">
        <div class="logo">
          <router-link to="/">FreeMarket</router-link>
        </div>
        <div class="nav-links">
          <template v-if="isAuthenticated">
            <router-link to="/profile">내 정보</router-link>
            <a href="#" @click.prevent="logout">로그아웃</a>
          </template>
          <template v-else>
            <router-link to="/login">로그인</router-link>
            <router-link to="/signup">회원가입</router-link>
          </template>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view/>
    </main>
    
    <footer v-if="!isCallbackRoute" class="footer">
      <div class="container">
        <p>&copy; 2025 FreeMarket. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapGetters('auth', ['isAuthenticated']),
    
    isCallbackRoute() {
      // OAuth 콜백 페이지에서는 네비게이션과 푸터를 숨김
      return this.$route.name === 'OAuthCallback';
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('auth/logout')
        .then(() => {
          this.$router.push('/login');
        })
        .catch(error => {
          console.error('로그아웃 중 오류:', error);
        });
    }
  }
}
</script>

<style>
/* 글로벌 스타일 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #333;
  background-color: #f8f9fa;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

a {
  text-decoration: none;
  color: #4299e1;
}

/* 네비게이션 스타일 */
.navbar {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: #4a5568;
  font-weight: 500;
}

.nav-links a:hover {
  color: #4299e1;
}

/* 메인 콘텐츠 스타일 */
.main-content {
  min-height: calc(100vh - 120px);
  padding: 2rem 0;
}

/* 푸터 스타일 */
.footer {
  background-color: #2d3748;
  color: white;
  padding: 1.5rem 0;
  text-align: center;
}
</style>
