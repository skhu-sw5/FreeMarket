<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <main class="py-6">
      <div class="container mx-auto px-4">
        <h1 class="text-2xl font-bold mb-6">관심 상품</h1>
        
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="bg-gray-200 animate-pulse h-64 rounded-lg"></div>
        </div>
        
        <div v-else-if="wishlist.length === 0" class="bg-white rounded-lg p-8 text-center">
          <p class="text-gray-500 mb-4">관심 상품이 없습니다.</p>
          <router-link 
            to="/products" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
          >
            상품 둘러보기
          </router-link>
        </div>
        
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProductCard 
            v-for="product in wishlist" 
            :key="product.product.id"
            :product="product.product"
            :stats="product.stats"
            @click="goToProduct(product.product.id)"
          >
            <template #actions>
              <button 
                @click.stop="removeFromWishlist(product.product.id)"
                class="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
              >
                <i class="fas fa-heart"></i>
              </button>
            </template>
          </ProductCard>
        </div>
      </div>
    </main>
    
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import ProductCard from '@/components/products/ProductCard.vue'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'WishlistView',
  
  components: {
    AppHeader,
    AppFooter,
    ProductCard
  },
  
  data() {
    return {
      loading: true
    }
  },
  
  computed: {
    ...mapState('products', ['wishlist'])
  },
  
  async created() {
    try {
      await this.fetchWishlist()
    } catch (error) {
      console.error('관심 상품 목록 로딩 오류:', error)
    } finally {
      this.loading = false
    }
  },
  
  methods: {
    ...mapActions('products', ['fetchWishlist', 'toggleWishlist']),
    
    async removeFromWishlist(productId) {
      try {
        await this.toggleWishlist(productId)
        await this.fetchWishlist()
        this.$toast.success('관심 상품에서 제거되었습니다')
      } catch (error) {
        console.error('관심 상품 제거 오류:', error)
        this.$toast.error('관심 상품 제거에 실패했습니다')
      }
    },
    
    goToProduct(id) {
      this.$router.push({ name: 'ProductDetail', params: { id } })
    }
  }
}
</script>
