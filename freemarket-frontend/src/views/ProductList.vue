<template>
  <div>
    <AppHeader />

    <section class="max-w-7xl mx-auto px-4 py-6">
      <h1 class="text-2xl font-semibold mb-4">{{ getPageTitle() }}</h1>

      <!-- 카테고리 필터 -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
            v-for="category in categories"
            :key="category.id"
            @click="handleCategoryChange(category.id)"
            :class="[
            'px-3 py-1 border rounded-full text-sm',
            category.id === activeCategory
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          ]"
        >
          {{ category.name }}
        </button>
        <button
            @click="handleCategoryChange(null)"
            :class="[
            'px-3 py-1 border rounded-full text-sm',
            !activeCategory
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          ]"
        >
          전체
        </button>
      </div>

      <!-- 검색 및 정렬 -->
      <div class="flex justify-between items-center mb-4">
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

        <select v-model="sortOption" @change="applySortOption" class="border px-2 py-1 rounded">
          <option value="createdAt,desc">최신순</option>
          <option value="price,asc">낮은 가격순</option>
          <option value="price,desc">높은 가격순</option>
        </select>
      </div>

      <!-- 필터 -->
      <ProductFilters
          :filters="filters"
          @update:filters="handleFilterChange"
          @reset="resetFilters"
      />

      <!-- 상품 카드 리스트 -->
      <div v-if="products.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            @click="goToProduct(product.id)"
        />
      </div>
      <div v-else class="text-center text-gray-500 mt-10">상품이 없습니다.</div>

      <!-- 페이지네이션 -->
      <div class="mt-8">
        <AppPagination
            :current-page="currentPage"
            :total-items="totalItems"
            :items-per-page="12"
            @page-changed="handlePageChange"
        />
      </div>
    </section>

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
  },
  watch: {
    $route: {
      handler(to) {
        const { category } = to.query
        if (category && category !== this.activeCategory) {
          this.activeCategory = category
        }
        this.fetchProductsWithFilters()
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('products', ['fetchProducts']),
    async fetchProductsWithFilters() {
      const { status, priceRange } = this.filters
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
    handlePageChange(page) {
      this.currentPage = page
      window.scrollTo(0, 0)
      this.fetchProductsWithFilters()
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
      this.$router.push({ name: 'ProductDetail', params: { id } })
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
    applySortOption() {
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
