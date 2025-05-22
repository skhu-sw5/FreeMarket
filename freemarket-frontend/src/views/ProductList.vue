<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader />

    <main class="flex-1">
      <section class="max-w-7xl mx-auto px-4 py-6">
        <h1 class="text-2xl font-semibold mb-4">{{ getPageTitle() }}</h1>

        <!-- 카테고리 필터는 ProductFilters 컴포넌트에서 처리하므로 여기서는 삭제 -->

        <!-- 정렬은 ProductFilters 컴포넌트에서 처리하므로 여기서는 검색만 남김 -->
        <div class="flex justify-end items-center mb-4">
          <div class="flex gap-2">
            <input
                type="text"
                v-model="searchKeyword"
                @keyup.enter="handleSearch"
                placeholder="상품명을 입력하세요"
                class="border px-3 py-1 rounded"
            />
            <button @click="handleSearch" class="bg-blue-500 text-white px-4 py-1 rounded">검색</button>
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
        <div v-if="products && products.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          <ProductCard
              v-for="item in products"
              :key="item.product.id"
              :product="item.product"
              :stats="item.stats"
              @click="goToProduct(item.product.id)"
          />
        </div>
        <div v-else-if="loading" class="text-center text-gray-500 mt-10">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-2">상품을 불러오는 중...</p>
        </div>
        <div v-else class="text-center text-gray-500 mt-10">상품을 찾을 수 없습니다.</div>

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
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import ProductCard from '@/components/products/ProductCard.vue'
import ProductFilters from '@/components/products/ProductFilters.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ProductList',
  components: {
    AppHeader,
    AppFooter,
    ProductCard,
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
      sortOption: 'createdAt,desc',
      totalItems: 0
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
        const response = await this.fetchProducts({
          page: this.currentPage - 1,
          category: this.activeCategory,
          keyword: this.searchQuery,
          seller: this.seller,
          status,
          minPrice: priceRange.min || undefined,
          maxPrice: priceRange.max || undefined,
          sort: this.sortOption
        })
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
        return category ? category.name : '전체 상품'
      } else {
        return '전체 상품'
      }
    },
    handleCategoryChange(categoryId) {
      this.activeCategory = categoryId
      this.currentPage = 1
      this.$router.replace({
        query: {
          ...this.$route.query,
          category: categoryId || undefined
        }
      })
      this.fetchProductsWithFilters()
    },
    handleFilterChange(newFilters) {
      this.filters = newFilters
      this.currentPage = 1
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
      this.sortOption = 'createdAt,desc'
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
    }
  }
}
</script>

<style scoped>
@media (max-width: 768px) {
  .xl\:grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .md\:flex-row {
    flex-direction: column;
  }
  .md\:w-auto {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .xl\:grid-cols-4,
  .lg\:grid-cols-3,
  .sm\:grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
