<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <main class="py-6">
      <div class="container mx-auto px-4">
        <nav class="mb-4 flex items-center text-sm">
          <router-link to="/" class="text-gray-500 hover:text-blue-600">홈</router-link>
          <span class="mx-2 text-gray-400">/</span>
          <router-link to="/products" class="text-gray-500 hover:text-blue-600">상품</router-link>
          <span v-if="product" class="mx-2 text-gray-400">/</span>
          <span v-if="product" class="text-gray-700">{{ product.product.name }}</span>
        </nav>
        
        <div v-if="loading" class="bg-white rounded-lg p-6">
          <div class="animate-pulse">
            <div class="flex flex-col md:flex-row">
              <div class="md:w-1/2 h-80 bg-gray-200 rounded-lg"></div>
              <div class="md:w-1/2 md:pl-8 mt-6 md:mt-0">
                <div class="h-8 bg-gray-200 rounded mb-4"></div>
                <div class="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div class="h-4 bg-gray-200 rounded mb-2"></div>
                <div class="h-4 bg-gray-200 rounded mb-2"></div>
                <div class="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
                <div class="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="!product" class="bg-white rounded-lg p-8 text-center">
          <p class="text-gray-500 mb-4">상품을 찾을 수 없습니다.</p>
          <router-link 
            to="/products" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
          >
            상품 목록으로 돌아가기
          </router-link>
        </div>
        
        <div v-else>
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- 상품 이미지 -->
              <div>
                <ProductGallery :images="productImages" />
              </div>
              
              <!-- 상품 정보 -->
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ product.product.name }}</h1>
                <p class="text-3xl font-bold mt-3">{{ formatPrice(product.product.price) }}원</p>
                
                <div class="flex items-center mt-4 space-x-4">
                  <div class="flex items-center text-sm">
                    <i class="far fa-eye text-gray-400 mr-1"></i>
                    <span>{{ product.stats.viewCount }} 조회</span>
                  </div>
                  <div class="flex items-center text-sm">
                    <i class="far fa-heart text-gray-400 mr-1"></i>
                    <span>{{ product.stats.wishlistCount }} 관심</span>
                  </div>
                </div>
                
                <div class="mt-6 border-t border-b py-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <h3 class="text-sm text-gray-500">카테고리</h3>
                      <p>{{ product.product.category }}</p>
                    </div>
                    <div>
                      <h3 class="text-sm text-gray-500">상태</h3>
                      <p>{{ product.product.status }}</p>
                    </div>
                    <div>
                      <h3 class="text-sm text-gray-500">판매자</h3>
                      <p>{{ product.product.sellerName }}</p>
                    </div>
                    <div>
                      <h3 class="text-sm text-gray-500">재고</h3>
                      <p>{{ product.product.stock }}개</p>
                    </div>
                  </div>
                </div>
                
                <div class="mt-6 space-y-4">
                  <button 
                    @click="toggleWishlistItem"
                    class="w-full px-4 py-3 border rounded-lg font-medium flex items-center justify-center space-x-2"
                    :class="product.stats.isWishlisted ? 'bg-red-50 border-red-400 text-red-500' : 'border-gray-300 hover:bg-gray-50'"
                  >
                    <i class="fa" :class="product.stats.isWishlisted ? 'fa-heart text-red-500' : 'fa-heart'"></i>
                    <span>{{ product.stats.isWishlisted ? '관심 상품에서 제거' : '관심 상품에 추가' }}</span>
                  </button>
                  
                  <button 
                    class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2"
                    @click="contactSeller"
                  >
                    <i class="fas fa-comment-dots"></i>
                    <span>판매자에게 문의하기</span>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 상품 설명 -->
            <div class="p-6 border-t">
              <h2 class="text-xl font-bold mb-4">상품 정보</h2>
              <p class="whitespace-pre-line">{{ product.product.description || '상품 설명이 없습니다.' }}</p>
            </div>
          </div>
          
          <!-- 판매자 정보 -->
          <div class="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold mb-4">판매자 정보</h2>
            <div class="flex items-center">
              <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <i class="fas fa-user text-gray-400 text-xl"></i>
              </div>
              <div class="ml-4">
                <h3 class="font-medium">{{ product.product.sellerName }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import ProductGallery from '@/components/products/ProductGallery.vue'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ProductDetail',
  
  components: {
    AppHeader,
    AppFooter,
    ProductGallery
  },
  
  props: {
    id: {
      type: String,
      required: true
    }
  },
  
  computed: {
    ...mapState('products', ['product', 'loading']),
    
    productImages() {
      if (!this.product) return []
      
      return this.product.product.imageUrls.map(url => ({
        url,
        thumbnail: url
      }))
    }
  },
  
  async created() {
    try {
      await this.fetchProduct(this.id)
    } catch (error) {
      console.error('상품 상세 정보 로딩 오류:', error)
    }
  },
  
  methods: {
    ...mapActions('products', ['fetchProduct', 'toggleWishlist']),
    
    formatPrice(price) {
      return new Intl.NumberFormat('ko-KR').format(price)
    },
    
    async toggleWishlistItem() {
      if (!this.isAuthenticated) {
        return this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
      }
      
      try {
        await this.toggleWishlist(this.product.product.id)
      } catch (error) {
        console.error('관심 상품 처리 오류:', error)
      }
    },
    
    contactSeller() {
      // 판매자 문의 기능 - 채팅 기능이 있다면 구현
      alert('판매자에게 문의하기 기능은 아직 구현되지 않았습니다.')
    },
    
    goToProduct(id) {
      if (id === this.id) return
      this.$router.push({ name: 'ProductDetail', params: { id } })
    },
    
    goToSellerProducts() {
      // 판매자의 상품 목록 페이지로 이동
      if (this.product && this.product.product.sellerName) {
        this.$router.push({ 
          name: 'ProductList', 
          query: { seller: this.product.product.sellerName } 
        })
      }
    },
    
    async fetchSellerProducts() {
      try {
        if (!this.product || !this.product.product.sellerName) return
        
        const response = await fetch(`https://freemarket.duckdns.org/api/products?sellerName=${encodeURIComponent(this.product.product.sellerName)}&size=4&status=ACTIVE`)
        
        if (!response.ok) {
          throw new Error('판매자 상품 목록을 불러오는데 실패했습니다.')
        }
        
        const data = await response.json()
        // 현재 상품을 제외한 다른 상품만 표시
        this.sellerProducts = data.data.content.filter(
          item => item.product.id !== this.product.product.id
        )
      } catch (error) {
        console.error('판매자 상품 목록 조회 오류:', error)
      }
    },
    
    async fetchRelatedProducts() {
      try {
        if (!this.product) return
        
        // 같은 카테고리의 상품 가져오기
        const response = await fetch(`https://freemarket.duckdns.org/api/products?category=${this.product.product.category}&size=4&status=ACTIVE`)
        
        if (!response.ok) {
          throw new Error('관련 상품 목록을 불러오는데 실패했습니다.')
        }
        
        const data = await response.json()
        // 현재 상품을 제외한 다른 상품만 표시
        this.relatedProducts = data.data.content.filter(
          item => item.product.id !== this.product.product.id
        )
      } catch (error) {
        console.error('관련 상품 목록 조회 오류:', error)
      }
    }
  }
}
</script>

<style scoped>
@media (max-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .md\:pl-8 {
    padding-left: 0;
  }
  
  .md\:mt-0 {
    margin-top: 1.5rem;
  }
}
</style>
