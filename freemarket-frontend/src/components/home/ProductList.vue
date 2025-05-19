<template>
  <div class="py-10 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">{{ title }}</h2>
        <router-link to="/products" class="text-blue-600 hover:underline flex items-center">
          더보기 <i class="fas fa-chevron-right ml-1 text-xs"></i>
        </router-link>
      </div>
      
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="i in 4" :key="i" class="bg-white animate-pulse h-72 rounded-lg shadow-sm p-4">
          <div class="bg-gray-200 h-40 rounded mb-4"></div>
          <div class="h-5 bg-gray-200 rounded mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      
      <div v-else-if="!products || products.length === 0" class="text-center py-8 text-gray-500 bg-white p-8 rounded-lg shadow-sm">
        <i class="far fa-frown text-4xl mb-4 text-gray-400"></i>
        <p>상품이 없습니다.</p>
        <router-link 
          to="/sell" 
          class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          상품 등록하기
        </router-link>
      </div>
      
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <ProductCard 
          v-for="product in products" 
          :key="product.product.id"
          :product="product.product"
          :stats="product.stats"
          @click="goToProduct(product.product.id)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ProductCard from '@/components/products/ProductCard.vue'

export default {
  name: 'HomeProductList',
  
  components: {
    ProductCard
  },
  
  props: {
    title: {
      type: String,
      required: true
    },
    products: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  methods: {
    goToProduct(id) {
      this.$router.push({ name: 'ProductDetail', params: { id } })
    }
  }
}
</script>

<style scoped>
@media (max-width: 768px) {
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .lg\:grid-cols-4,
  .md\:grid-cols-3,
  .sm\:grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
