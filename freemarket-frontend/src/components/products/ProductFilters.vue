<template>
  <div class="card shadow-sm mb-6">
    <div class="container py-3">
      <!-- 카테고리 필터 -->
      <div class="overflow-x-auto pb-3">
        <div class="flex space-x-2 min-w-max">
          <button
            @click="$emit('category-change', null)"
            :class="[
              'px-3 py-1.5 rounded-lg',
              activeCategory === null 
                ? 'bg-primary dark:bg-primary-light text-white dark:text-gray-900' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            전체
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            @click="$emit('category-change', category.id)"
            :class="[
              'px-3 py-1.5 rounded-lg whitespace-nowrap',
              activeCategory === category.id 
                ? 'bg-primary dark:bg-primary-light text-white dark:text-gray-900' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            {{ category.name }}
          </button>
        </div>
      </div>
      
      <!-- 필터 버튼과 정렬 옵션 -->
      <div class="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between items-center">
        <button 
          class="button-outline flex items-center space-x-1"
          @click="isFilterOpen = !isFilterOpen"
        >
          <i class="fas fa-sliders-h"></i>
          <span>필터</span>
        </button>
        
        <div class="flex space-x-2">
          <select v-model="sortOption" @change="applySortOption" class="select">
            <option value="LATEST">최신순</option>
            <option value="PRICE_ASC">낮은 가격순</option>
            <option value="PRICE_DESC">높은 가격순</option>
          </select>
        </div>
      </div>
      
      <!-- 필터 패널 -->
      <div v-if="isFilterOpen" class="mt-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-medium text-gray-800 dark:text-gray-100">상세 필터</h3>
          <button @click="isFilterOpen = false" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <!-- 가격 범위 -->
          <div>
            <h4 class="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">가격 범위</h4>
            <div class="flex items-center space-x-2">
              <input
                v-model="priceRange.min"
                type="number"
                placeholder="최소 가격"
                class="input"
              />
              <span class="text-gray-500 dark:text-gray-400">-</span>
              <input
                v-model="priceRange.max"
                type="number"
                placeholder="최대 가격"
                class="input"
              />
            </div>
          </div>
          
          <!-- 상품 상태 -->
          <div>
            <h4 class="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">상품 상태</h4>
            <div class="flex space-x-2">
              <button
                @click="selectedStatus = 'ACTIVE'"
                :class="[
                  'px-3 py-1.5 rounded-lg',
                  selectedStatus === 'ACTIVE' 
                    ? 'bg-primary dark:bg-primary-light text-white dark:text-gray-900' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                ]"
              >
                판매중
              </button>
              <button
                @click="selectedStatus = 'SOLD_OUT'"
                :class="[
                  'px-3 py-1.5 rounded-lg',
                  selectedStatus === 'SOLD_OUT' 
                    ? 'bg-primary dark:bg-primary-light text-white dark:text-gray-900' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                ]"
              >
                품절
              </button>
            </div>
          </div>
          
          <div class="pt-2">
            <button 
              @click="applyFilters"
              class="button-primary w-full"
            >
              필터 적용
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductFilters',
  
  props: {
    filters: {
      type: Object,
      required: true
    },
    categories: {
      type: Array,
      default: () => [
        { id: 'BOOKS', name: '교재/서적' },
        { id: 'ELECTRONICS', name: '전자기기' },
        { id: 'FASHION', name: '의류/패션' },
        { id: 'BEAUTY', name: '화장품/미용' },
        { id: 'SPORTS', name: '스포츠/레저' },
        { id: 'HOUSEHOLD', name: '생활용품' },
        { id: 'HOBBY', name: '취미/게임' },
        { id: 'OTHERS', name: '기타' }
      ]
    },
    activeCategory: {
      type: String,
      default: null
    }
  },
  
  data() {
    return {
      isFilterOpen: false,
      priceRange: { 
        min: this.filters.priceRange?.min || '', 
        max: this.filters.priceRange?.max || '' 
      },
      selectedStatus: this.filters.status || 'ACTIVE',
      sortOption: 'LATEST' // 기본값 최신순
    }
  },
  
  methods: {
    applyFilters() {
      this.$emit('update:filters', {
        priceRange: this.priceRange,
        status: this.selectedStatus
      })
      this.isFilterOpen = false
    },
    
    applySortOption() {
      this.$emit('sort-change', this.sortOption);
    },
    
    reset() {
      this.priceRange = { min: '', max: '' };
      this.selectedStatus = 'ACTIVE';
      this.sortOption = 'LATEST';
      this.$emit('reset');
    }
  }
}
</script>
