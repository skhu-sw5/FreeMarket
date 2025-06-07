<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader />
    <main class="flex-1">
      <Banner />
      <Categories />
      
      <!-- 앱 설명 섹션 -->
      <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold mb-4">FreeMarket과 함께하는 <span class="text-blue-600">안전한 거래</span></h2>
            <p class="text-gray-600 max-w-2xl mx-auto">대학생들을 위한 중고 거래 플랫폼 FreeMarket은 캠퍼스 내 안전하고 편리한 거래를 지원합니다.</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-gray-50 p-6 rounded-lg text-center hover:shadow-md transition-shadow">
              <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-shield-alt text-2xl"></i>
              </div>
              <h3 class="text-xl font-bold mb-2">안전한 거래</h3>
              <p class="text-gray-600">신뢰할 수 있는 교내 거래 시스템으로 안전하게 거래하세요.</p>
            </div>
            
            <div class="bg-gray-50 p-6 rounded-lg text-center hover:shadow-md transition-shadow">
              <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-tags text-2xl"></i>
              </div>
              <h3 class="text-xl font-bold mb-2">합리적인 가격</h3>
              <p class="text-gray-600">중개 수수료 없이 합리적인 가격으로 물건을 사고 팔 수 있어요.</p>
            </div>
            
            <div class="bg-gray-50 p-6 rounded-lg text-center hover:shadow-md transition-shadow">
              <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-graduation-cap text-2xl"></i>
              </div>
              <h3 class="text-xl font-bold mb-2">학업 맞춤 제품</h3>
              <p class="text-gray-600">교재, 전공 서적 등 학업에 필요한 다양한 상품을 만나보세요.</p>
            </div>
          </div>
        </div>
      </section>
      
      <ProductList title="신규 상품" :products="newProducts" :loading="loading" />
      <ProductList title="인기 상품" :products="popularProducts" :loading="loading" />
      
      <!-- 초기화 중일 때는 CTA 섹션 숨김 -->
      <template v-if="isInitialized">
        <!-- 가입 유도 섹션 (비로그인 사용자) -->
        <section v-if="!isAuthenticated" class="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div class="container mx-auto px-4 text-center">
            <h2 class="text-3xl font-bold mb-4">지금 바로 시작하세요!</h2>
            <p class="text-xl mb-8 max-w-2xl mx-auto">FreeMarket에 가입하고 캠퍼스 내 안전한 중고 거래를 경험해보세요.</p>
            <div class="space-x-4">
              <router-link to="/register" class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 inline-block">
                회원가입
              </router-link>
              <router-link to="/login" class="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors duration-200 inline-block">
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
        // 실제 API 호출 시에는 아래 주석을 해제하고 사용
        // const [newProductsRes, popularProductsRes] = await Promise.all([
        //   this.fetchProducts({ sort: 'newest', limit: 8 }),
        //   this.fetchProducts({ sort: 'popular', limit: 8 })
        // ])
        
        // this.newProducts = newProductsRes.data.products
        // this.popularProducts = popularProductsRes.data.products
        
        // 임시로 mock 데이터 사용
        this.newProducts = this.getMockProducts(8)
        this.popularProducts = this.getMockProducts(8, true)
        
      } catch (error) {
        console.error('상품을 불러오는 중 오류가 발생했습니다:', error)
        // 오류 발생 시 빈 배열로 설정
        this.newProducts = []
        this.popularProducts = []
      } finally {
        this.loading = false
      }
    },
    
    // 모의 데이터 생성 (임시용)
    getMockProducts(count, isPopular = false) {
      const mockProducts = []
      const categories = ['전자기기', '의류', '가구', '도서', '기타']
      
      for (let i = 1; i <= count; i++) {
        const basePrice = Math.floor(Math.random() * 100) * 1000 + 10000
        const discount = isPopular ? Math.floor(Math.random() * 30) : 0
        const price = basePrice - Math.floor(basePrice * (discount / 100))
        
        mockProducts.push({
          id: i,
          title: `${isPopular ? '인기 ' : ''}중고 상품 ${i}`,
          price: price,
          originalPrice: isPopular ? basePrice : null,
          discount: isPopular ? discount : 0,
          image: `https://picsum.photos/300/200?random=${i}`,
          category: categories[Math.floor(Math.random() * categories.length)],
          isLiked: Math.random() > 0.7,
          isNew: !isPopular && Math.random() > 0.5,
          isHot: isPopular,
          seller: `판매자${i}`,
          location: '서울시 성북구',
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          viewCount: Math.floor(Math.random() * 1000)
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
