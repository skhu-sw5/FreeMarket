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
                    @click="buyProduct"
                    :disabled="product.product.stock <= 0 || product.product.status === 'SOLD_OUT'"
                  >
                    <i class="fas fa-shopping-cart"></i>
                    <span>{{ product.product.stock <= 0 || product.product.status === 'SOLD_OUT' ? '품절' : '구매하기' }}</span>
                  </button>
                  
                  <button 
                    class="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 flex items-center justify-center space-x-2"
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
            <!-- 리뷰 섹션 추가 -->
            <div class="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold mb-4">상품 리뷰</h2>
            <ReviewList :productId="product.product.id" />
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
import ReviewList from '@/components/reviews/ReviewList.vue'
import { mapState, mapActions } from 'vuex'

export default {
  components: {
    AppHeader,
    AppFooter,
    ProductGallery,
    ReviewList
  },

  // computed 부분은 그대로 유지
  computed: {
    ...mapState('products', ['product', 'loading']),
    
    productImages() {
      if (!this.product) return []
      
      return this.product.product.imageUrls.map(url => ({
        url,
        thumbnail: url
      }))
    },
    
    // 인증 상태와 토큰을 가져오는 computed 속성 추가
    isAuthenticated() {
      return this.$store.state.auth.isAuthenticated
    },
    
    token() {
      return this.$store.state.auth.token
    }
  },
  
  // created 훅은 그대로 유지
  
  methods: {
    // toggleWishlist 액션 제거하고 fetchProduct만 유지
    ...mapActions('products', ['fetchProduct']),
    
    formatPrice(price) {
      return new Intl.NumberFormat('ko-KR').format(price)
    },
    
    // 상품 구매 메서드 추가
    async buyProduct() {
      if (!this.isAuthenticated) {
        return this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
      }
      
      try {
        if (confirm('이 상품을 구매하시겠습니까?')) {
          const productId = this.product.product.id
          
          const response = await fetch(`/api/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({
              productId: productId,
              quantity: 1
            })
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || '상품 구매 중 오류가 발생했습니다.')
          }
          
          const result = await response.json()
          
          // 성공 메시지 표시
          if (this.$toast) {
            this.$toast.success('상품 구매가 완료되었습니다.')
          } else {
            alert('상품 구매가 완료되었습니다.')
          }
          
          // 구매 후 상품 상태 업데이트
          this.fetchProduct(productId)
          
          // 주문 완료 페이지로 이동
          this.$router.push({ name: 'OrderComplete', params: { id: result.data.id } })
        }
      } catch (error) {
        console.error('상품 구매 오류:', error)
        if (this.$toast) {
          this.$toast.error(error.message || '상품 구매 중 오류가 발생했습니다.')
        } else {
          alert(error.message || '상품 구매 중 오류가 발생했습니다.')
        }
      }
    },
    
    // toggleWishlistItem 메서드를 직접 API 호출 방식으로 수정
    async toggleWishlistItem() {
      if (!this.isAuthenticated) {
        return this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
      }
      
      try {
        const productId = this.product.product.id
        
        const response = await fetch(`https://freemarket.duckdns.org/api/products/${productId}/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('관심 상품 처리 중 오류가 발생했습니다.')
        }
        
        const result = await response.json()
        
        // 위시리스트 상태 업데이트
        this.product.stats.isWishlisted = result.wishlisted
        
        // 위시리스트 카운트 업데이트
        if (result.wishlisted) {
          this.product.stats.wishlistCount = (this.product.stats.wishlistCount || 0) + 1
        } else {
          this.product.stats.wishlistCount = Math.max(0, (this.product.stats.wishlistCount || 0) - 1)
        }
        
        // 토스트 메시지 표시
        if (this.$toast) {
          this.$toast.success(result.wishlisted ? '관심 상품에 추가되었습니다.' : '관심 상품에서 제거되었습니다.')
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
    
    // 나머지 메서드들은 그대로 유지
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