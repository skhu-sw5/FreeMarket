<template>
  <header class="bg-white shadow-md">
    <div class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button 
            @click="isMenuOpen = !isMenuOpen"
            class="md:hidden"
          >
            <i class="fas" :class="isMenuOpen ? 'fa-times' : 'fa-bars'"></i>
          </button>
          <router-link to="/" class="text-xl font-bold text-blue-600">FreeMarket</router-link>
        </div>
        
        <div class="hidden md:flex flex-1 mx-10">
          <div class="relative w-full max-w-2xl">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="상품명, 카테고리 검색"
              class="w-full border border-gray-300 rounded-lg py-2 px-4 pl-10"
              @keyup.enter="search"
            />
            <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- 초기화 중일 때 로딩 표시 -->
          <template v-if="!isInitialized">
            <div class="flex items-center space-x-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span class="text-sm text-gray-500">로딩 중...</span>
            </div>
          </template>
          
          <!-- 초기화 완료 후 인증 상태에 따른 메뉴 -->
          <template v-else-if="isAuthenticated">
            <router-link to="/wishlist" class="text-gray-700 hover:text-blue-600">
              <i class="far fa-heart"></i>
            </router-link>
            <router-link to="/user/orders" class="text-gray-700 hover:text-blue-600">
              <i class="fas fa-shopping-bag"></i>
            </router-link>
            
            <!-- 사용자 프로필 링크 -->
            <router-link to="/profile" class="text-gray-700 hover:text-blue-600">
              <i class="far fa-user"></i>
            </router-link>
            
            <!-- 로그아웃 버튼 -->
            <button 
              @click="handleLogout"
              class="text-gray-700 hover:text-red-600"
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
            class="w-full border border-gray-300 rounded-lg py-2 px-4 pl-10"
            @keyup.enter="search"
          />
          <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
        </div>
      </div>
      
      <!-- 모바일 메뉴 -->
      <div v-if="isMenuOpen" class="md:hidden mt-3 py-2 border-t">
        <nav class="flex flex-col space-y-2">
          <router-link to="/categories" class="py-2 hover:text-blue-600">카테고리</router-link>
          <router-link to="/products" class="py-2 hover:text-blue-600">전체 상품</router-link>
          
          <!-- 초기화 중일 때 -->
          <template v-if="!isInitialized">
            <div class="py-2 text-gray-500">
              <i class="fas fa-spinner fa-spin mr-2"></i>로딩 중...
            </div>
          </template>
          
          <!-- 로그인 상태 -->
          <template v-else-if="isAuthenticated">
            <div class="border-t pt-2 mt-2">
              <router-link to="/wishlist" class="block py-2 hover:text-blue-600">
                <i class="far fa-heart mr-2"></i>관심 상품
              </router-link>
              <router-link to="/user/orders" class="block py-2 hover:text-blue-600">
                <i class="fas fa-shopping-bag mr-2"></i>주문 내역
              </router-link>
              <router-link to="/profile" class="block py-2 hover:text-blue-600">
                <i class="far fa-user mr-2"></i>프로필
              </router-link>
              <button @click="handleLogout" class="py-2 text-left hover:text-red-600 w-full">
                <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
              </button>
              <router-link to="/sell" class="block py-2 hover:text-blue-600 font-medium text-blue-600">
                <i class="fas fa-plus mr-2"></i>판매하기
              </router-link>
            </div>
          </template>
          
          <!-- 비로그인 상태 -->
          <template v-else>
            <div class="border-t pt-2 mt-2">
              <router-link to="/login" class="block py-2 hover:text-blue-600">
                <i class="fas fa-sign-in-alt mr-2"></i>로그인
              </router-link>
              <router-link to="/sell" class="block py-2 hover:text-blue-600 font-medium text-blue-600">
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
      searchQuery: ''
    }
  },
  
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'isInitialized', 'currentUser'])
  },
  
  mounted() {
    // 외부 클릭 시 드롭다운 메뉴 닫기
    document.addEventListener('click', this.handleOutsideClick)
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
    }
  }
}
</script>

<style scoped>
.button-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors;
}

.button-outline {
  @apply px-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors;
}
</style>
