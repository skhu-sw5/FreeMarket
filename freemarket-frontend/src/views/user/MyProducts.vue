<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <main class="py-6">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">내 판매 상품 관리</h1>
          <router-link 
            to="/sell" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <i class="fas fa-plus"></i>
            <span>새 상품 등록</span>
          </router-link>
        </div>
        
        <!-- 필터 탭 -->
        <div class="bg-white rounded-lg shadow-sm mb-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                v-for="tab in filterTabs"
                :key="tab.key"
                @click="activeFilter = tab.key"
                :class="[
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                  activeFilter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                {{ tab.name }} ({{ getFilteredProducts(tab.key).length }})
              </button>
            </nav>
          </div>
        </div>
        
        <!-- 로딩 상태 -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="n in 6" :key="n" class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="animate-pulse">
              <div class="aspect-square bg-gray-200"></div>
              <div class="p-4 space-y-3">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded w-2/3"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 상품 목록 -->
        <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MyProductCard 
            v-for="product in filteredProducts" 
            :key="product.product.id"
            :product="product.product"
            :stats="product.stats"
            @click="goToProduct"
            @edit="editProduct"
            @delete="deleteProductItem"
            @refresh="fetchMyProducts"
          />
        </div>
        
        <!-- 빈 상태 -->
        <div v-else class="bg-white rounded-lg shadow-sm p-12 text-center">
          <div class="mb-4">
            <i class="fas fa-box-open text-6xl text-gray-300"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ getEmptyMessage() }}
          </h3>
          <p class="text-gray-500 mb-6">
            {{ getEmptyDescription() }}
          </p>
          <router-link 
            v-if="activeFilter === 'all'"
            to="/sell" 
            class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <i class="fas fa-plus"></i>
            <span>첫 상품 등록하기</span>
          </router-link>
        </div>
      </div>
    </main>
    
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import MyProductCard from '@/components/products/MyProductCard.vue'
import { mapActions } from 'vuex'
import { apiGet } from '@/utils/api'

export default {
  name: 'MyProductsView',
  
  components: {
    AppHeader,
    AppFooter,
    MyProductCard
  },
  
  data() {
    return {
      loading: true,
      myProducts: [],
      activeFilter: 'all',
      filterTabs: [
        { key: 'all', name: '전체' },
        { key: 'active', name: '판매중' },
        { key: 'sold', name: '판매완료' },
        { key: 'inactive', name: '판매중지' }
      ]
    }
  },
  
  computed: {
    filteredProducts() {
      return this.getFilteredProducts(this.activeFilter)
    }
  },
  
  async created() {
    // 내 상품 목록 조회에서 조회수 증가를 건너뛰도록 설정
    this.$store.dispatch('products/setSkipViewIncrement', true);
    
    try {
      await this.fetchMyProducts();
    } finally {
      // 원래 상태로 복원
      this.$store.dispatch('products/setSkipViewIncrement', false);
    }
  },
  
  methods: {
    ...mapActions('products', ['deleteProduct']),
    
    async fetchMyProducts() {
      this.loading = true
      
      try {
        console.log('내 판매 상품 목록 가져오기 요청 시작...')
        
        const data = await apiGet('/api/users/profile/selling', {
          skipViewCount: true // 조회수 증가하지 않음
        })
        console.log('내 판매 상품 목록 응답 데이터:', data)
        
        if (data && data.data) {
          if (data.data.activeProducts || data.data.soldProducts) {
            // 판매 내역 응답 구조
            const activeProducts = (data.data.activeProducts || []).map(product => ({
              product: {
                ...product,
                id: product.productId || product.id,
                status: product.status || 'ACTIVE'
              },
              stats: { 
                viewCount: product.viewCount || 0,
                wishlistCount: product.wishlistCount || 0
              }
            }))
            
            const soldProducts = (data.data.soldProducts || []).map(product => ({
              product: {
                ...product,
                id: product.productId || product.id,
                status: product.status || 'SOLD_OUT'
              },
              stats: { 
                viewCount: product.viewCount || 0,
                wishlistCount: product.wishlistCount || 0
              }
            }))
            
            this.myProducts = [...activeProducts, ...soldProducts]
          } else if (Array.isArray(data.data)) {
            // 배열 형태의 응답인 경우
            this.myProducts = data.data.map(product => {
              // product 자체가 객체인지 또는 product 속성이 있는 객체인지 확인
              const productData = product.product || product;
              const stats = product.stats || {};
              
              return {
                product: {
                  ...productData,
                  id: productData.productId || productData.id,
                  status: productData.status || 'ACTIVE'
                },
                stats: {
                  viewCount: stats.viewCount || 0,
                  wishlistCount: stats.wishlistCount || 0
                }
              };
            });
          } else if (data.data.content && Array.isArray(data.data.content)) {
            // 페이징 응답인 경우
            this.myProducts = data.data.content.map(product => {
              // product 자체가 객체인지 또는 product 속성이 있는 객체인지 확인
              const productData = product.product || product;
              const stats = product.stats || {};
              
              return {
                product: {
                  ...productData,
                  id: productData.productId || productData.id,
                  status: productData.status || 'ACTIVE'
                },
                stats: {
                  viewCount: stats.viewCount || 0,
                  wishlistCount: stats.wishlistCount || 0
                }
              };
            });
          } else {
            console.warn('예상치 못한 응답 구조:', data)
            this.myProducts = []
          }
        } else {
          this.myProducts = []
        }
        
        // 데이터 구조 확인 로그
        if (this.myProducts.length > 0) {
          console.log('처리된 상품 데이터 샘플:', this.myProducts[0]);
        }
      } catch (error) {
        console.error('내 판매 상품 목록 조회 오류:', error)
        this.myProducts = []
      } finally {
        this.loading = false
      }
    },
    
    getFilteredProducts(filter) {
      if (!this.myProducts) return []
      
      switch (filter) {
        case 'active':
          return this.myProducts.filter(item => 
            ['ACTIVE', '판매중'].includes(item.product.status)
          )
        case 'sold':
          return this.myProducts.filter(item => 
            ['SOLD_OUT', '판매완료'].includes(item.product.status)
          )
        case 'inactive':
          return this.myProducts.filter(item => 
            ['INACTIVE', 'DISCONTINUED', '판매중지'].includes(item.product.status)
          )
        default:
          return this.myProducts
      }
    },
    
    getEmptyMessage() {
      switch (this.activeFilter) {
        case 'active':
          return '판매중인 상품이 없습니다'
        case 'sold':
          return '판매완료된 상품이 없습니다'
        case 'inactive':
          return '판매중지된 상품이 없습니다'
        default:
          return '등록한 상품이 없습니다'
      }
    },
    
    getEmptyDescription() {
      switch (this.activeFilter) {
        case 'active':
          return '현재 판매중인 상품이 없습니다. 새로운 상품을 등록해보세요.'
        case 'sold':
          return '아직 판매완료된 상품이 없습니다.'
        case 'inactive':
          return '판매를 중지한 상품이 없습니다.'
        default:
          return '아직 등록한 상품이 없습니다. 첫 상품을 등록해보세요!'
      }
    },
    
    goToProduct(productId) {
      if (!productId) {
        console.error('유효하지 않은 상품 ID:', productId)
        return
      }
      
      this.$router.push({ name: 'ProductDetail', params: { id: String(productId) } })
    },
    
    editProduct(productId) {
      if (!productId) {
        console.error('유효하지 않은 상품 ID:', productId)
        return
      }
      
      this.$router.push({ name: 'EditProduct', params: { id: String(productId) } })
    },
    
    async deleteProductItem(productId) {
      if (!productId) {
        console.error('유효하지 않은 상품 ID:', productId)
        return
      }
      
      try {
        await this.deleteProduct(productId)
        
        // 성공 메시지 표시
        if (this.$toast) {
          this.$toast.success('상품이 성공적으로 삭제되었습니다.')
        } else {
          alert('상품이 성공적으로 삭제되었습니다.')
        }
        
        // 상품 목록 새로고침
        await this.fetchMyProducts()
      } catch (error) {
        console.error('상품 삭제 오류:', error)
        if (this.$toast) {
          this.$toast.error(error.message || '상품 삭제 중 오류가 발생했습니다.')
        } else {
          alert(error.message || '상품 삭제 중 오류가 발생했습니다.')
        }
      }
    }
  }
}
</script>

<style scoped>
.aspect-square {
  aspect-ratio: 1 / 1;
}
</style>
