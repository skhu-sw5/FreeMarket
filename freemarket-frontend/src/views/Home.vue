<template>
  <div class="flex flex-col min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
    <AppHeader />
    <main class="flex-1">
      <Banner />
      <Categories />
      
      <!-- 앱 설명 섹션 -->
      <section class="py-16 bg-white dark:bg-surface-dark transition-colors duration-300">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">FreeMarket과 함께하는 <span class="text-primary dark:text-primary-light">안전한 거래</span></h2>
            <p class="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">대학생들을 위한 중고 거래 플랫폼 FreeMarket은 캠퍼스 내 안전하고 편리한 거래를 지원합니다.</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl text-center hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div class="w-16 h-16 bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-shield-alt text-2xl"></i>
              </div>
              <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">안전한 거래</h3>
              <p class="text-gray-600 dark:text-gray-300">신뢰할 수 있는 교내 거래 시스템으로 안전하게 거래하세요.</p>
            </div>
            
            <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl text-center hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div class="w-16 h-16 bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-tags text-2xl"></i>
              </div>
              <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">합리적인 가격</h3>
              <p class="text-gray-600 dark:text-gray-300">중개 수수료 없이 합리적인 가격으로 물건을 사고 팔 수 있어요.</p>
            </div>
            
            <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl text-center hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div class="w-16 h-16 bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-graduation-cap text-2xl"></i>
              </div>
              <h3 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">학업 맞춤 제품</h3>
              <p class="text-gray-600 dark:text-gray-300">교재, 전공 서적 등 학업에 필요한 다양한 상품을 만나보세요.</p>
            </div>
          </div>
        </div>
      </section>
      
      <ProductList title="신규 상품" :products="newProducts" :loading="loading" />
      <ProductList title="인기 상품" :products="popularProducts" :loading="loading" />
      
      <!-- 초기화 중일 때는 CTA 섹션 숨김 -->
      <template v-if="isInitialized">
        <!-- 가입 유도 섹션 (비로그인 사용자) -->
        <section v-if="!isAuthenticated" class="py-16 bg-gradient-to-r from-primary to-accent text-white">
          <div class="container mx-auto px-4 text-center">
            <h2 class="text-3xl font-bold mb-4">지금 바로 시작하세요!</h2>
            <p class="text-xl mb-8 max-w-2xl mx-auto">FreeMarket에 가입하고 캠퍼스 내 안전한 중고 거래를 경험해보세요.</p>
            <div class="space-x-4">
              <router-link to="/register" class="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 inline-block shadow-lg">
                회원가입
              </router-link>
              <router-link to="/login" class="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors duration-200 inline-block">
                로그인
              </router-link>
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import Banner from '@/components/home/Banner.vue'
import Categories from '@/components/home/Categories.vue'
import ProductList from '@/components/home/ProductList.vue'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'HomeView',
  components: {
    AppHeader,
    Banner,
    Categories,
    ProductList
  },
  
  data() {
    return {
      loading: true,
      newProducts: [],
      popularProducts: []
    }
  },
  
  computed: {
    ...mapState('auth', ['isAuthenticated', 'isInitialized', 'token', 'user'])
  },
  
  created() {
    // 앱 초기화가 완료된 후에만 데이터 로드
    if (this.isInitialized) {
      this.fetchHomePageProducts()
    } else {
      // 초기화가 완료되지 않았을 경우 이벤트 리스너 등록
      this.$store.watch(
        state => state.auth.isInitialized,
        (newVal) => {
          if (newVal) this.fetchHomePageProducts()
        }
      )
    }
  },
  
  methods: {
    ...mapActions('products', ['fetchProducts']),
    
    async fetchHomePageProducts() {
      this.loading = true
      
      try {
        // 실제 API 호출
        const [newProductsRes, popularProductsRes] = await Promise.all([
          this.$store.dispatch('products/fetchProducts', { 
            sort: 'LATEST', 
            size: 8,
            page: 0,
            status: 'ACTIVE'
          }),
          this.$store.dispatch('products/fetchProducts', { 
            sort: 'VIEW_COUNT', 
            size: 8,
            page: 0,
            status: 'ACTIVE'
          })
        ])
        
        // API 응답에서 content 배열을 추출하고 올바른 형식으로 변환
        if (newProductsRes && newProductsRes.content) {
          this.newProducts = newProductsRes.content.map(product => ({
            product: product.product || product,
            stats: product.stats || {
              viewCount: product.viewCount || 0,
              wishlistCount: product.wishlistCount || 0,
              isWishlisted: product.isWishlisted || false
            }
          }))
        } else {
          this.newProducts = []
        }
        
        if (popularProductsRes && popularProductsRes.content) {
          this.popularProducts = popularProductsRes.content.map(product => ({
            product: product.product || product,
            stats: product.stats || {
              viewCount: product.viewCount || 0,
              wishlistCount: product.wishlistCount || 0,
              isWishlisted: product.isWishlisted || false
            }
          }))
        } else {
          this.popularProducts = []
        }
        
      } catch (error) {
        console.error('상품을 불러오는 중 오류가 발생했습니다:', error)
        // 오류 발생 시 mock 데이터 사용
        console.log('API 오류로 인해 mock 데이터를 사용합니다.')
        this.newProducts = this.getMockProducts(8)
        this.popularProducts = this.getMockProducts(8, true)
      } finally {
        this.loading = false
      }
    },
    
    // 모의 데이터 생성 (임시용) - ProductList와 ProductCard가 기대하는 구조로 생성
    getMockProducts(count, isPopular = false) {
      const mockProducts = []
      const categories = ['ELECTRONICS', 'FASHION', 'BOOKS', 'BEAUTY', 'SPORTS', 'HOUSEHOLD', 'HOBBY', 'OTHERS']
      
      for (let i = 1; i <= count; i++) {
        const basePrice = Math.floor(Math.random() * 100) * 1000 + 10000
        const discount = isPopular ? Math.floor(Math.random() * 30) : 0
        const price = basePrice - Math.floor(basePrice * (discount / 100))
        
        mockProducts.push({
          product: {
            id: i,
            name: `${isPopular ? '인기 ' : ''}중고 상품 ${i}`,
            price: price,
            thumbnailUrl: `https://picsum.photos/300/200?random=${i}`,
            category: categories[Math.floor(Math.random() * categories.length)],
            status: 'ACTIVE',
            sellerId: 1,
            sellerName: `판매자${i}`,
            createdDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
            updatedDate: new Date().toISOString(),
            description: `중고 상품 ${i}에 대한 설명입니다.`,
            stock: 1
          },
          stats: {
            viewCount: Math.floor(Math.random() * 1000),
            wishlistCount: Math.floor(Math.random() * 50),
            isWishlisted: Math.random() > 0.7
          }
        })
      }
      
      return mockProducts
    }
  }
}
</script>

<style scoped>
/* 스타일 유지 */
</style>
