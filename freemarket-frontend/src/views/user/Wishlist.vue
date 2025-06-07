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
            v-for="product in formattedWishlist" 
            :key="product.product.id"
            :product="product.product"
            :stats="product.stats"
            @click="goToProduct(product.product.id)"
            @wishlist-toggle="removeFromWishlist(product.product.id)"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import ProductCard from '@/components/products/ProductCard.vue'
import { mapState, mapActions } from 'vuex'
import { apiGet } from '@/utils/api'

export default {
  name: 'WishlistView',
  
  components: {
    AppHeader,
    ProductCard
  },
  
  data() {
    return {
      loading: true
    }
  },
  
  computed: {
    ...mapState('products', ['wishlist']),
    
    // formattedWishlist() 계산된 속성에서는 
    // 이미 API에서 제공하는 정보를 사용하도록 합니다
    formattedWishlist() {
      return this.wishlist.map(item => {
        // 기존 stats 데이터 유지하면서 기본값 설정
        const stats = item.stats || {};
        return {
          ...item,
          stats: {
            viewCount: stats.viewCount || 0,
            wishlistCount: stats.wishlistCount || 0,
            isWishlisted: true // 관심 상품 목록이므로 항상 true
          }
        };
      });
    }
  },
  
  async created() {
    try {
      // 관심 상품 목록을 가져옴 (이 API는 이미 조회수와 관심수를 포함하고 있음)
      await this.fetchWishlist();
      // 개별 상품 조회를 하지 않으므로 조회수 증가가 발생하지 않음
    } catch (error) {
      console.error('관심 상품 목록 로딩 오류:', error);
    } finally {
      this.loading = false;
    }
  },
  
  methods: {
    ...mapActions('products', ['fetchWishlist', 'toggleWishlist']),
    

    
    async removeFromWishlist(productId) {
      try {
        // toggleWishlist 액션은 이미 ProductCard에서 실행되었으므로 중복 호출하지 않음
        // 대신 wishlist 목록을 업데이트하여 제거된 항목을 반영
        await this.fetchWishlist();
      } catch (error) {
        console.error('관심 상품 목록 업데이트 오류:', error);
      }
    },
    
    goToProduct(id) {
      this.$router.push({ name: 'ProductDetail', params: { id } })
    }
  }
}
</script>
