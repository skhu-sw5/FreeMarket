<template>
  <div class="bg-white rounded-lg shadow-sm overflow-hidden border hover:shadow-md transition-shadow duration-300">
    <!-- 상품 이미지 -->
    <div class="relative aspect-square overflow-hidden bg-gray-100">
      <img 
        v-if="product.thumbnailUrl" 
        :src="product.thumbnailUrl" 
        :alt="product.name"
        class="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
        @click="goToProduct"
      />
      <div 
        v-else 
        class="w-full h-full flex items-center justify-center text-gray-400 cursor-pointer"
        @click="goToProduct"
      >
        <i class="fas fa-image text-4xl"></i>
      </div>
      
      <!-- 상품 상태 배지 -->
      <div class="absolute top-2 left-2">
        <span 
          class="px-2 py-1 text-xs font-medium rounded-full"
          :class="getStatusClass(product.status)"
        >
          {{ product.status }}
        </span>
      </div>
      
      <!-- 관리 버튼들 -->
      <div class="absolute top-2 right-2 flex space-x-1">
        <button
          @click.stop="editProduct"
          class="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          title="상품 수정"
        >
          <i class="fas fa-edit text-sm"></i>
        </button>
        <button
          @click.stop="confirmDelete"
          class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          title="상품 삭제"
        >
          <i class="fas fa-trash-alt text-sm"></i>
        </button>
      </div>
    </div>
    
    <!-- 상품 정보 -->
    <div class="p-4">
      <h3 
        class="font-medium text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
        @click="goToProduct"
      >
        {{ product.name }}
      </h3>
      
      <div class="flex justify-between items-center mb-3">
        <span class="text-lg font-bold text-blue-600">
          {{ formatPrice(product.price) }}원
        </span>
        <span class="text-sm text-gray-500">
          재고 {{ product.stock || 0 }}개
        </span>
      </div>
      
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span>{{ product.category }}</span>
        <div class="flex items-center space-x-3">
          <span class="flex items-center">
            <i class="far fa-eye mr-1"></i>
            {{ stats?.viewCount || 0 }}
          </span>
          <span class="flex items-center">
            <i class="far fa-heart mr-1"></i>
            {{ stats?.wishlistCount || 0 }}
          </span>
        </div>
      </div>
      
      <!-- 판매 완료 정보 (있는 경우) -->
      <div v-if="product.buyerName || product.soldDate" class="mt-3 pt-3 border-t text-sm text-gray-600">
        <div v-if="product.buyerName" class="flex justify-between">
          <span>구매자:</span>
          <span class="font-medium">{{ product.buyerName }}</span>
        </div>
        <div v-if="product.soldDate" class="flex justify-between mt-1">
          <span>판매일:</span>
          <span>{{ formatDate(product.soldDate) }}</span>
        </div>
      </div>
      
      <!-- 등록일 -->
      <div class="mt-3 text-xs text-gray-400">
        등록일: {{ formatDate(product.createdDate) }}
      </div>
      
      <!-- 상품 관리 버튼들 (하단) -->
      <div class="mt-4 grid grid-cols-2 gap-2">
        <button
          @click="editProduct"
          class="px-3 py-2 bg-blue-500 text-white text-sm rounded font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
        >
          <i class="fas fa-edit"></i>
          <span>수정</span>
        </button>
        <button
          @click="confirmDelete"
          class="px-3 py-2 bg-red-500 text-white text-sm rounded font-medium hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
        >
          <i class="fas fa-trash-alt"></i>
          <span>삭제</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyProductCard',
  
  props: {
    product: {
      type: Object,
      required: true
    },
    stats: {
      type: Object,
      default: () => ({
        viewCount: 0,
        wishlistCount: 0
      })
    }
  },
  
  emits: ['edit', 'delete', 'click'],
  
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('ko-KR').format(price)
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    
    getStatusClass(status) {
      const statusClasses = {
        '판매중': 'bg-green-100 text-green-800',
        'ACTIVE': 'bg-green-100 text-green-800',
        '품절': 'bg-red-100 text-red-800',
        'SOLD_OUT': 'bg-red-100 text-red-800',
        '판매완료': 'bg-blue-100 text-blue-800',
        '판매중지': 'bg-gray-100 text-gray-800',
        'INACTIVE': 'bg-gray-100 text-gray-800',
        'DISCONTINUED': 'bg-gray-100 text-gray-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    },
    
    goToProduct() {
      this.$emit('click', this.product.id)
    },
    
    editProduct() {
      this.$emit('edit', this.product.id)
    },
    
    confirmDelete() {
      if (confirm(`'${this.product.name}' 상품을 정말로 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
        this.$emit('delete', this.product.id)
      }
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

.aspect-square {
  aspect-ratio: 1 / 1;
}
</style>
