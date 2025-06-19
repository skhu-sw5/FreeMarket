<template>
  <header class="bg-white dark:bg-surface-dark shadow-lg dark:shadow-gray-900/20 transition-colors duration-300">
    <div class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button 
            @click="isMenuOpen = !isMenuOpen"
            class="md:hidden text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors"
          >
            <i class="fas" :class="isMenuOpen ? 'fa-times' : 'fa-bars'"></i>
          </button>
          <router-link to="/" class="text-xl font-bold text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary transition-colors">FreeMarket</router-link>
        </div>
        
        <div class="hidden md:flex flex-1 mx-10">
          <div class="relative w-full max-w-2xl">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="상품명, 카테고리 검색"
              class="input pl-10"
              @keyup.enter="search"
            />
            <i class="fas fa-search absolute left-3 top-3 text-gray-400 dark:text-gray-500"></i>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- 다크모드 토글 버튼 -->
          <button @click="toggleDarkMode" class="text-xl focus:outline-none transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" :title="isDark ? '라이트 모드' : '다크 모드'">
            <i v-if="isDark" class="fas fa-sun text-yellow-400"></i>
            <i v-else class="fas fa-moon text-gray-700 dark:text-gray-300"></i>
          </button>
          
          <!-- 초기화 중일 때 로딩 표시 -->
          <template v-if="!isInitialized">
            <div class="flex items-center space-x-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary dark:border-primary-light"></div>
              <span class="text-sm text-gray-500 dark:text-gray-400">로딩 중...</span>
            </div>
          </template>
          
          <!-- 초기화 완료 후 인증 상태에 따른 메뉴 -->
          <template v-else-if="isAuthenticated">
            <router-link to="/wishlist" class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <i class="far fa-heart"></i>
            </router-link>
            <router-link to="/user/orders" class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <i class="fas fa-shopping-bag"></i>
            </router-link>
            
            <!-- 채팅 아이콘 -->
            <router-link to="/chat" class="relative text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <i class="far fa-comments"></i>
              <span v-if="unreadChatCount > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {{ unreadChatCount > 99 ? '99+' : unreadChatCount }}
              </span>
            </router-link>
            
            <!-- 사용자 프로필 링크 -->
            <router-link to="/profile" class="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <i class="far fa-user"></i>
            </router-link>
            
            <!-- 로그아웃 버튼 -->
            <button 
              @click="handleLogout"
              class="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title="로그아웃"
            >
              <i class="fas fa-sign-out-alt"></i>
            </button>
            
            <router-link to="/sell" class="button-primary">
              판매하기
            </router-link>
          </template>
          
          <!-- 비로그인 상태 -->
          <template v-else>
            <router-link to="/login" class="button-outline flex items-center space-x-1">
              <i class="fas fa-sign-in-alt"></i>
              <span>로그인</span>
            </router-link>
            <router-link to="/sell" class="button-primary">
              판매하기
            </router-link>
          </template>
        </div>
      </div>
      
      <!-- 모바일 검색창 -->
      <div class="mt-3 md:hidden">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="상품명, 카테고리 검색"
            class="input pl-10"
            @keyup.enter="search"
          />
          <i class="fas fa-search absolute left-3 top-3 text-gray-400 dark:text-gray-500"></i>
        </div>
      </div>
      
      <!-- 모바일 메뉴 -->
      <div v-if="isMenuOpen" class="md:hidden mt-3 py-2 border-t border-gray-200 dark:border-gray-700">
        <nav class="flex flex-col space-y-2">
          <router-link to="/categories" class="py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors">카테고리</router-link>
          <router-link to="/products" class="py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors">전체 상품</router-link>
          
          <!-- 초기화 중일 때 -->
          <template v-if="!isInitialized">
            <div class="py-2 text-gray-500 dark:text-gray-400">
              <i class="fas fa-spinner fa-spin mr-2"></i>로딩 중...
            </div>
          </template>
          
          <!-- 로그인 상태 -->
          <template v-else-if="isAuthenticated">
            <div class="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <router-link to="/wishlist" class="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors">
                <i class="far fa-heart mr-2"></i>관심 상품
              </router-link>
              <router-link to="/user/orders" class="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors">
                <i class="fas fa-shopping-bag mr-2"></i>주문 내역
              </router-link>
              <router-link to="/chat" class="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors">
                <i class="far fa-comments mr-2"></i>채팅
                <span v-if="unreadChatCount > 0" class="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {{ unreadChatCount > 99 ? '99+' : unreadChatCount }}
                </span>
              </router-link>
              <router-link to="/profile" class="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors">
                <i class="far fa-user mr-2"></i>프로필
              </router-link>
              <button @click="handleLogout" class="py-2 text-left text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 w-full transition-colors">
                <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
              </button>
              <router-link to="/sell" class="block py-2 text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary font-medium transition-colors">
                <i class="fas fa-plus mr-2"></i>판매하기
              </router-link>
            </div>
          </template>
          
          <!-- 비로그인 상태 -->
          <template v-else>
            <div class="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <router-link to="/login" class="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors">
                <i class="fas fa-sign-in-alt mr-2"></i>로그인
              </router-link>
              <router-link to="/sell" class="block py-2 text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary font-medium transition-colors">
                <i class="fas fa-plus mr-2"></i>판매하기
              </router-link>
            </div>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AppHeader',
  
  data() {
    return {
      isMenuOpen: false,
      searchQuery: '',
      unreadChatCount: 0,
      isDark: false
    }
  },
  
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'isInitialized', 'currentUser'])
  },
  
  mounted() {
    // 외부 클릭 시 드롭다운 메뉴 닫기
    document.addEventListener('click', this.handleOutsideClick)
    this.isDark = document.documentElement.classList.contains('dark')
  },
  
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick)
  },
  
  methods: {
    ...mapActions('auth', ['logout']),
    
    handleOutsideClick(event) {
      // 모바일 메뉴 외부 클릭 시 닫기
      if (!this.$el.contains(event.target)) {
        this.isMenuOpen = false
      }
    },
    
    async handleLogout() {
      this.isMenuOpen = false
      await this.logout();
      // 로그아웃 후 메인 페이지로 리다이렉트
      this.$router.push('/');
    },
    
    search() {
      if (!this.searchQuery.trim()) return
      
      this.$router.push({
        name: 'ProductList',
        query: { keyword: this.searchQuery }
      })
      
      this.isMenuOpen = false
    },
    
    toggleDarkMode() {
      this.isDark = !this.isDark
      if (this.isDark) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    }
  }
}
</script>

<style scoped>
.button-primary {
  @apply px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-lg font-medium hover:bg-primary-dark dark:hover:bg-primary transition-colors shadow-sm;
}

.button-outline {
  @apply px-4 py-2 border border-primary text-primary dark:border-primary-light dark:text-primary-light rounded-lg font-medium hover:bg-primary/10 dark:hover:bg-primary-light/10 transition-colors;
}
</style>
