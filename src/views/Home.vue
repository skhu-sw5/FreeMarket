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
            <p class="text-xl mb-8">FreeMarket에서 필요한 물건을 쉽고 안전하게 거래하세요.</p>
            <!-- 디버그 정보 (개발용) -->
            <div v-if="$route.query.debug" class="mb-4 text-sm opacity-70">
              인증상태: {{ isAuthenticated }}, 토큰: {{ token ? '있음' : '없음' }}, 초기화: {{ isInitialized }}
            </div>
            <div class="flex justify-center space-x-4">
              <router-link 
                to="/register" 
                class="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
              >
                회원가입
              </router-link>
              <router-link 
                to="/products" 
                class="px-6 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                상품 둘러보기
              </router-link>
            </div>
          </div>
        </section>
        
        <!-- 로그인한 사용자 전용 섹션 -->
        <section v-else class="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div class="container mx-auto px-4 text-center">
            <h2 class="text-3xl font-bold mb-4">환영합니다! 🎉</h2>
            <p class="text-xl mb-8">
              <span v-if="user && user.name">{{ user.name }}님, </span>
              지금 바로 상품을 등록하거나 원하는 상품을 찾아보세요.
            </p>
            <!-- 디버그 정보 (개발용) -->
            <div v-if="$route.query.debug" class="mb-4 text-sm opacity-70">
              인증상태: {{ isAuthenticated }}, 사용자: {{ user ? user.name : '정보없음' }}, 초기화: {{ isInitialized }}
            </div>
            <div class="flex justify-center space-x-4">
              <router-link 
                to="/products/create" 
                class="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
              >
                상품 등록하기
              </router-link>
              <router-link 
                to="/products" 
                class="px-6 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                상품 둘러보기
              </router-link>
            </div>
          </div>
        </section>
      </template>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import Banner from '@/components/home/Banner.vue'
import Categories from '@/components/home/Categories.vue'
import ProductList from '@/components/home/ProductList.vue'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'HomePage',
  
  components: {
    AppHeader,
    AppFooter,
    Banner,
    Categories,
    ProductList
  },
  
  data() {
    return {
      newProducts: [],
      popularProducts: [],
      loading: true
    }
  },
  
  computed: {
    ...mapState('auth', ['isAuthenticated', 'isInitialized', 'token', 'user'])
  },
  
  async created() {
    console.log('Home.vue created - 인증 상태:', this.isAuthenticated);
    console.log('Home.vue created - 초기화 상태:', this.isInitialized);
    console.log('Home.vue created - 토큰:', this.token ? '있음' : '없음');
    console.log('Home.vue created - 사용자:', this.user);
    
    try {
      await this.fetchHomePageProducts()
    } catch (error) {
      console.error('홈페이지 상품 로딩 오류:', error)
    }
  },
  
  methods: {
    ...mapActions('products', ['fetchProducts']),
    
    async fetchHomePageProducts() {
      this.loading = true;
      
      try {
        // 신규 상품 (최신순, 판매중인 상품만)
        try {
          const newProductsResponse = await this.fetchProducts({
            page: 0,
            size: 4,
            status: 'ACTIVE',
            sort: 'LATEST'  // 최신순 정렬 (백엔드 ENUM 값에 맞게 수정)
          });
          this.newProducts = newProductsResponse.content || [];
        } catch (error) {
          console.error('신규 상품 로딩 오류:', error);
          this.newProducts = this.getMockProducts(4);
        }
        
        // 인기 상품 (조회수 높은 순, 판매중인 상품만)  
        try {
          const popularProductsResponse = await this.fetchProducts({
            page: 0,
            size: 4,
            status: 'ACTIVE',
            sort: 'LATEST'  // 최신순 정렬 (백엔드 ENUM 값에 맞게 수정)
          });
          this.popularProducts = popularProductsResponse.content || [];
        } catch (error) {
          console.error('인기 상품 로딩 오류:', error);
          this.popularProducts = this.getMockProducts(4);
        }
      } catch (error) {
        console.error('상품 로딩 오류:', error);
        // API 호출 실패 시 임시 데이터로 대체
        this.newProducts = this.getMockProducts(4);
        this.popularProducts = this.getMockProducts(4);
      } finally {
        this.loading = false;
      }
    },
    
    // 모의 데이터 생성 (임시용)
    getMockProducts(count) {
      const categories = ['BOOKS', 'ELECTRONICS', 'FASHION', 'HOBBY', 'HOUSEHOLD'];
      const mockProducts = [];
      
      for (let i = 0; i < count; i++) {
        mockProducts.push({
          product: {
            id: i + 1,
            name: `샘플 상품 ${i + 1}`,
            price: 10000 * (i + 1),
            category: categories[i % categories.length],
            createdAt: new Date().toISOString(),
            status: 'ACTIVE',
            thumbnailUrl: null
          },
          stats: {
            viewCount: Math.floor(Math.random() * 100),
            wishlistCount: Math.floor(Math.random() * 50),
            isWishlisted: false
          }
        });
      }
      
      return mockProducts;
    }
  }
}
</script>

<style scoped>
@media (max-width: 768px) {
  .md\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .py-16 {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
}
</style>
