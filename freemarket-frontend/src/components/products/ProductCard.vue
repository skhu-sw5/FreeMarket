<template>
  <div @click="$emit('click')" class="bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-lg dark:shadow-gray-900/20 hover:shadow-xl dark:hover:shadow-gray-900/30 transition-all hover:translate-y-[-3px] transform duration-300 cursor-pointer relative border border-gray-100 dark:border-gray-700">
    <div class="relative">
      <img 
        :src="getImageUrl(product.thumbnailUrl)" 
        :alt="product.name" 
        class="w-full h-48 object-cover"
      />
      <div 
        v-if="product.status === 'SOLD_OUT'"
        class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <span class="text-white font-bold text-lg">SOLD OUT</span>
      </div>
      <button 
        @click.stop="toggleWishlist"
        class="absolute top-2 right-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg dark:shadow-gray-900/20 transition-colors hover:scale-110"
        :class="{ 'text-red-500': stats?.isWishlisted, 'text-gray-400 dark:text-gray-300': !stats?.isWishlisted }"
      >
        <i :class="stats?.isWishlisted ? 'fas fa-heart' : 'far fa-heart'"></i>
      </button>
      <div v-if="isNew" class="absolute top-2 left-2 bg-primary dark:bg-primary-light text-white px-2 py-1 text-xs rounded-md font-medium">
        NEW
      </div>
    </div>
    <div class="p-4">
      <div class="flex justify-between items-start">
        <h3 class="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 min-h-[2.5rem]">{{ product.name }}</h3>
      </div>
      <p class="mt-2 text-lg font-bold text-primary dark:text-primary-light">{{ formatPrice(product.price) }}원</p>
      <div class="mt-2 flex items-center justify-between">
        <span class="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{{ getCategoryName(product.category) }}</span>
        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <i class="far fa-eye mr-1"></i>
          <span>{{ stats?.viewCount || 0 }}</span>
          <i class="far fa-heart mx-1 ml-2"></i>
          <span>{{ stats?.wishlistCount || 0 }}</span>
        </div>
      </div>
    </div>
    <slot name="actions"></slot>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'ProductCard',
  
  props: {
    product: {
      type: Object,
      required: true
    },
    stats: {
      type: Object,
      default: () => ({
        viewCount: 0,
        wishlistCount: 0,
        isWishlisted: false
      })
    }
  },
  
  data() {
    return {
      baseUrl: ''
    }
  },
  
  created() {
    // 항상 전체 URL 사용
    this.baseUrl = 'https://freemarket.duckdns.org';
  },
  
  computed: {
    isNew() {
      if (!this.product.createdDate) return false;
      
      // 상품이 3일 이내에 등록된 경우 NEW 표시
      const createdAt = new Date(this.product.createdDate);
      const now = new Date();
      const diffDays = Math.ceil((now - createdAt) / (1000 * 60 * 60 * 24));
      
      return diffDays <= 3;
    }
  },
  
  methods: {
    ...mapActions('products', ['toggleWishlist']),
    
    async toggleWishlist(event) {
      event.preventDefault()
      event.stopPropagation()
      
      if (!this.$store.state.auth.isAuthenticated) {
        this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        return
      }
      
      try {
        // 현재 상태를 저장
        const wasWishlisted = this.stats.isWishlisted
        
        // API 호출 및 상태 업데이트
        const result = await this.$store.dispatch('products/toggleWishlist', this.product.id)
        
        // 위시리스트 토글 이벤트 발생 (부모 컴포넌트에 알림)
        this.$emit('wishlist-toggle', this.product.id)
        
        // 토스트 메시지 표시 (API 응답의 실제 상태 사용)
        if (this.$toast) {
          const message = result.isWishlisted ? '관심 상품에 추가되었습니다.' : '관심 상품에서 제거되었습니다.'
          this.$toast.success(message)
        }
      } catch (error) {
        console.error('관심 상품 처리 오류:', error)
        if (this.$toast) {
          this.$toast.error('관심 상품 처리 중 오류가 발생했습니다.')
        } else {
          alert('관심 상품 처리 중 오류가 발생했습니다.')
        }
      }
    },
    
    getImageUrl(url) {
      if (!url) {
        // 프로젝트 내 기본 이미지로 대체
        return '/default-image.png';
      }
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return `${this.baseUrl}${url}`;
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('ko-KR').format(price)
    },
    
    getCategoryName(categoryId) {
      const categories = {
        'BOOKS': '교재/서적',
        'ELECTRONICS': '전자기기',
        'FASHION': '의류/패션',
        'BEAUTY': '화장품/미용',
        'SPORTS': '스포츠/레저',
        'HOUSEHOLD': '생활용품',
        'HOBBY': '취미/게임',
        'OTHERS': '기타'
      };
      
      return categories[categoryId] || categoryId;
    }
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
