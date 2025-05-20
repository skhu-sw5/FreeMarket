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
          <template v-if="isAuthenticated">
            <router-link to="/wishlist" class="text-gray-700 hover:text-blue-600">
              <i class="far fa-heart"></i>
            </router-link>
            <router-link to="/user/orders" class="text-gray-700 hover:text-blue-600">
              <i class="fas fa-shopping-bag"></i>
            </router-link>
            <router-link to="/profile" class="text-gray-700 hover:text-blue-600">
              <i class="far fa-user"></i>
            </router-link>
            <button @click="handleLogout" class="text-gray-700 hover:text-blue-600">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="button-outline flex items-center space-x-1">
              <i class="fas fa-sign-in-alt"></i>
              <span>로그인</span>
            </router-link>
          </template>
          <router-link to="/sell" class="button-primary">
            판매하기
          </router-link>
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
        <nav class="flex flex-col space-y-3">
          <router-link to="/categories" class="py-2 hover:text-blue-600">카테고리</router-link>
          <router-link to="/products" class="py-2 hover:text-blue-600">전체 상품</router-link>
          <template v-if="isAuthenticated">
            <router-link to="/profile" class="py-2 hover:text-blue-600">내 프로필</router-link>
            <router-link to="/wishlist" class="py-2 hover:text-blue-600">관심 상품</router-link>
            <router-link to="/user/orders" class="py-2 hover:text-blue-600">주문 내역</router-link>
            <button @click="handleLogout" class="py-2 text-left hover:text-blue-600">로그아웃</button>
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
    ...mapGetters('auth', ['isAuthenticated', 'currentUser'])
  },
  
  methods: {
    ...mapActions('auth', ['logout']),
    
    async handleLogout() {
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
