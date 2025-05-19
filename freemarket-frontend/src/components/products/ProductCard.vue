<template>
  <div @click="$emit('click')" class="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-all hover:translate-y-[-3px] transform duration-200 cursor-pointer relative">
    <div class="relative">
      <img 
        :src="product.thumbnailUrl || '/img/no-image.png'" 
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
        class="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors"
        :class="{ 'text-red-500': stats.isWishlisted }"
      >
        <i class="fa" :class="stats.isWishlisted ? 'fa-heart' : 'fa-heart'"></i>
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
      
      try {
        await this.toggleWishlist(this.product.id)
      } catch (error) {
        console.error('관심 상품 처리 오류:', error)
      }
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
