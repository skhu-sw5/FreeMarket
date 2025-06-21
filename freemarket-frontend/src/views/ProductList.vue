<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <AppHeader />

    <main class="py-6 flex-grow">
      <div class="container mx-auto px-4">
        <h1 class="text-2xl font-bold mb-6">{{ getPageTitle() }}</h1>

        <!-- 검색 -->
        <div class="flex justify-end items-center mb-4">
          <div class="flex gap-2">
            <input
                type="text"
                v-model="searchKeyword"
                @keyup.enter="handleSearch"
                placeholder="상품명을 입력하세요"
                class="input"
            />
            <button @click="handleSearch" class="button-primary">
              검색
            </button>
          </div>
        </div>

        <!-- 필터 -->
        <ProductFilters
            :filters="filters"
            :activeCategory="activeCategory"
            :categories="categories"
            @category-change="handleCategoryChange"
            @update:filters="handleFilterChange"
            @sort-change="handleSortChange"
            @reset="resetFilters"
        />

        <!-- 상품 카드 리스트 -->
        <div class="bg-white p-6 rounded-lg shadow-sm mt-6">
          <div v-if="loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p class="mt-2 text-gray-500">상품을 불러오는 중...</p>
          </div>
          
          <div v-else-if="products && products.length === 0" class="text-center py-8">
            <p class="text-gray-500 mb-4">상품을 찾을 수 없습니다.</p>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="item in products" 
              :key="item.product.id"
              @click="goToProduct(item.product.id)"
              class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <!-- 상품 이미지 -->
              <div class="relative mb-4">
                <img 
                  :src="getImageUrl(item.product.thumbnailUrl)" 
                  :alt="item.product.name"
                  class="w-full h-48 object-cover rounded-lg"
                  @error="handleImageError"
                />
                
                <!-- 찜하기 버튼 -->
                <button 
                  @click.stop="toggleWishlist(item.product.id, item.stats.isWishlisted)"
                  class="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md transition-colors"
                  :class="{ 'text-red-500': item.stats.isWishlisted, 'text-gray-400': !item.stats.isWishlisted }"
                >
                  <i :class="item.stats.isWishlisted ? 'fas fa-heart' : 'far fa-heart'"></i>
                </button>
                
                <!-- SOLD OUT 오버레이 -->
                <div 
                  v-if="item.product.status === 'SOLD_OUT'"
                  class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg"
                >
                  <span class="text-white font-bold text-lg">SOLD OUT</span>
                </div>
              </div>
              
              <!-- 상품 정보 -->
              <div>
                <h3 class="font-medium text-gray-900 mb-2 line-clamp-2">{{ item.product.name }}</h3>
                <p class="text-blue-600 font-bold text-lg mb-2">{{ formatPrice(item.product.price) }}원</p>
                
                <!-- 카테고리와 통계 -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {{ getCategoryName(item.product.category) }}
                  </span>
                  <div class="flex items-center text-sm text-gray-500 space-x-3">
                    <div class="flex items-center">
                      <i class="far fa-eye mr-1"></i>
                      <span>{{ item.stats.viewCount || 0 }}</span>
                    </div>
                    <div class="flex items-center">
                      <i class="far fa-heart mr-1"></i>
                      <span>{{ item.stats.wishlistCount || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <div class="mt-8">
          <AppPagination
              :current-page="currentPage"
              :total-pages="totalPages"
              :total-items="totalItems"
              :items-per-page="12"
              @page-changed="handlePageChange"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import ProductFilters from '@/components/products/ProductFilters.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ProductList',
  components: {
    AppHeader,
    ProductFilters,
    AppPagination
  },
  data() {
    return {
      currentPage: 1,
      filters: {
        priceRange: { min: '', max: '' },
        status: 'ACTIVE'
      },
      activeCategory: null,
      categories: [
        { id: 'BOOKS', name: '교재/서적' },
        { id: 'ELECTRONICS', name: '전자기기' },
        { id: 'FASHION', name: '의류/패션' },
        { id: 'BEAUTY', name: '화장품/미용' },
        { id: 'SPORTS', name: '스포츠/레저' },
        { id: 'HOUSEHOLD', name: '생활용품' },
        { id: 'HOBBY', name: '취미/게임' },
        { id: 'OTHERS', name: '기타' },
      ],
      searchKeyword: '',
      sortOption: 'LATEST',
      totalItems: 0,
      baseUrl: 'https://freemarket.duckdns.org'
    }
  },
  computed: {
    ...mapState('products', ['products', 'loading', 'totalPages']),
    searchQuery() {
      return this.$route.query.keyword
    },
    seller() {
      return this.$route.query.seller
    }
  },
  created() {
    // p 쿼리 파라미터가 있으면 page로 변환 후 즉시 return
    if (this.$route.query.p) {
      const query = { ...this.$route.query, page: this.$route.query.p };
      delete query.p;
      this.$router.replace({ ...this.$route, query });
      return;
    }
    if (this.searchQuery) {
      this.searchKeyword = this.searchQuery
    }
    const { category } = this.$route.query
    if (category) {
      this.activeCategory = category
    }
    // 컴포넌트 생성 시 즉시 데이터 로드
    this.fetchProductsWithFilters()
  },
  watch: {
    $route: {
      handler(to) {
        const { category } = to.query
        if (category && category !== this.activeCategory) {
          this.activeCategory = category
        }
        // 라우트 변경 시 즉시 데이터를 다시 가져옴
        this.fetchProductsWithFilters()
      },
      immediate: false // created에서 이미 호출하므로 immediate를 false로 변경
    }
  },
  methods: {
    ...mapActions('products', ['fetchProducts']),
    
    async fetchProductsWithFilters() {
      const { status, priceRange } = this.filters
      console.log('상품 데이터 요청:', {
        page: this.currentPage - 1,
        category: this.activeCategory,
        keyword: this.searchQuery,
        status,
        sort: this.sortOption
      });
      
      try {
        // 로딩 상태로 변경
        this.loading = true;
        
        const fetchParams = {
          page: Math.max(0, this.currentPage - 1), // 0 이상 보장
          size: 12
        };
        if (this.activeCategory) fetchParams.category = this.activeCategory;
        if (this.searchKeyword || this.searchQuery) fetchParams.keyword = this.searchKeyword || this.searchQuery;
        if (this.sortOption) fetchParams.sort = this.sortOption;
        if (this.seller) fetchParams.sellerName = this.seller;
        if (priceRange.min) fetchParams.minPrice = priceRange.min;
        if (priceRange.max) fetchParams.maxPrice = priceRange.max;
        if (this.filters.status) fetchParams.status = this.filters.status;
        const response = await this.fetchProducts(fetchParams)
        
        this.totalItems = response.totalElements || 0
        console.log('페이지 정보:', {
          현재페이지: this.currentPage,
          총페이지수: this.totalPages,
          총항목수: this.totalItems
        });
      } catch (error) {
        console.error('상품 목록 로딩 오류:', error)
      }
    },
    
    getPageTitle() {
      if (this.seller) {
        return `${this.seller}님의 상품`
      } else if (this.searchQuery) {
        return `"${this.searchQuery}" 검색 결과`
      } else if (this.activeCategory) {
        const category = this.categories.find(cat => cat.id === this.activeCategory)
        return category ? `${category.name} 카테고리` : '전체 상품'
      } else {
        return '전체 상품'
      }
    },
    
    handleCategoryChange(categoryId) {
      // 카테고리 변경 시
      this.activeCategory = categoryId
      this.currentPage = 1 // 페이지 초기화
      
      // URL 쿼리 파라미터 업데이트
      this.$router.replace({
        query: {
          ...this.$route.query,
          category: categoryId || undefined,
          page: undefined // 페이지 초기화
        }
      })
      
      // 필터 적용하여 상품 목록 다시 로드
      this.fetchProductsWithFilters()
    },
    
    handleFilterChange(newFilters) {
      this.filters = newFilters
      this.currentPage = 1 // 페이지 초기화
      this.fetchProductsWithFilters()
    },
    
    handleSortChange(sortValue) {
      this.sortOption = sortValue
      this.fetchProductsWithFilters()
    },
    
    handlePageChange(page) {
      console.log('페이지 변경:', page);
      // 유효한 페이지 범위 확인
      if (page < 1 || page > this.totalPages) {
        console.warn('유효하지 않은 페이지 번호:', page);
        return;
      }
      
      this.currentPage = page;
      window.scrollTo(0, 0);
      this.fetchProductsWithFilters();
    },
    
    resetFilters() {
      this.activeCategory = null
      this.filters = {
        priceRange: { min: '', max: '' },
        status: 'ACTIVE'
      }
      this.searchKeyword = ''
      this.sortOption = 'LATEST'
      this.$router.replace({ query: {} })
      this.fetchProductsWithFilters()
    },
    
    goToProduct(id) {
      console.log('상품 상세 페이지로 이동:', id);
      this.$router.push({ name: 'ProductDetail', params: { id } });
    },
    
    handleSearch() {
      if (this.searchKeyword.trim()) {
        this.$router.replace({
          query: {
            ...this.$route.query,
            keyword: this.searchKeyword
          }
        })
      } else {
        const query = { ...this.$route.query }
        delete query.keyword
        this.$router.replace({ query })
      }
      this.currentPage = 1
      this.fetchProductsWithFilters()
    },
    
    getImageUrl(url) {
      if (!url) {
        // 프로젝트 내 기본 이미지로 대체
        return '/default-image.png';
      }
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return `${this.baseUrl}${url}`;
    },
    
    handleImageError(event) {
      if (event.target.src.includes('default-image.png')) return;
      event.target.onerror = null;
      event.target.src = '/default-image.png';
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('ko-KR').format(price)
    },
    
    getCategoryName(categoryId) {
      const categories = {
        'BOOKS': '교재/서적',
        'ELECTRONICS': '전자기기',
        'FASHION': '의류/패션',
        'BEAUTY': '화장품/미용',
        'SPORTS': '스포츠/레저',
        'HOUSEHOLD': '생활용품',
        'HOBBY': '취미/게임',
        'OTHERS': '기타'
      };
      
      return categories[categoryId] || categoryId;
    },
    
    async toggleWishlist(productId, isCurrentlyWishlisted) {
      if (!this.$store.state.auth.isAuthenticated) {
        this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        return
      }
      
      try {
        // 위시리스트 토글 API 호출
        const result = await this.$store.dispatch('products/toggleWishlist', productId)
        
        // 해당 상품의 상태를 즉시 업데이트
        const productIndex = this.products.findIndex(item => item.product.id === productId)
        if (productIndex !== -1) {
          this.products[productIndex].stats.isWishlisted = result.isWishlisted
          this.products[productIndex].stats.wishlistCount = result.wishlistCount
        }
        
        // 토스트 메시지 표시
        if (this.$toast) {
          const message = result.isWishlisted ? '관심 상품에 추가되었습니다.' : '관심 상품에서 제거되었습니다.'
          this.$toast.success(message)
        }
      } catch (error) {
        console.error('관심 상품 처리 오류:', error)
        if (this.$toast) {
          this.$toast.error('관심 상품 처리 중 오류가 발생했습니다.')
        } else {
          alert('관심 상품 처리 중 오류가 발생했습니다.')
        }
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

/* 반응형 그리드 조정 */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
