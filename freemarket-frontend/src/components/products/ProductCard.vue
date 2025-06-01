<template>
  <div @click="$emit('click')" class="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-all hover:translate-y-[-3px] transform duration-200 cursor-pointer relative">
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
        class="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md transition-colors"
        :class="{ 'text-red-500': stats.isWishlisted, 'text-gray-400': !stats.isWishlisted }"
      >
        <i :class="stats.isWishlisted ? 'fas fa-heart' : 'far fa-heart'"></i>
      </button>
      <div v-if="isNew" class="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 text-xs rounded-md font-medium">
        NEW
      </div>
    </div>
    <div class="p-4">
      <div class="flex justify-between items-start">
        <h3 class="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">{{ product.name }}</h3>
      </div>
      <p class="mt-2 text-lg font-bold text-blue-600">{{ formatPrice(product.price) }}원</p>
      <p class="text-xs text-gray-500">
        등록일: {{ product.createdAt ? formatDate(product.createdAt) : '정보 없음' }}
      </p>
      <div class="mt-2 flex items-center justify-between">
        <span class="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{{ getCategoryName(product.category) }}</span>
        <div class="flex items-center text-sm text-gray-500">
          <i class="far fa-eye mr-1"></i>
          <span>{{ stats.viewCount }}</span>
          <i class="far fa-heart mx-1 ml-2"></i>
          <span>{{ stats.wishlistCount }}</span>
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
      if (!this.product.createdAt) return false;
      
      // 상품이 3일 이내에 등록된 경우 NEW 표시
      const createdAt = new Date(this.product.createdAt);
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
        // 미리 만들어진 placeholder 이미지 사용
        return 'data:image/svg+xml,%3Csvg width="300" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="100%25" height="100%25" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial, sans-serif" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
      }
      
      // 이미 전체 URL인 경우 그대로 반환
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      
      // 상대 경로인 경우 baseUrl 추가
      return `${this.baseUrl}${url}`;
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('ko-KR').format(price)
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      // YYYY년 MM월 DD일 HH:MM 형식으로 포맷
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/\./g, '/').replace(/\s+/g, ' ');
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
