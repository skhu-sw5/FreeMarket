<template>
  <div class="bg-white shadow-sm mb-6 rounded-lg">
    <div class="container py-3">
      <!-- 카테고리 필터 -->
      <div class="overflow-x-auto pb-3">
        <div class="flex space-x-2 min-w-max">
          <button
            @click="$emit('category-change', null)"
            :class="[
              'px-3 py-1.5 rounded-lg',
              activeCategory === null 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            ]"
          >
            {{ category.name }}
          </button>
        </div>
      </div>
      
      <!-- 필터 버튼과 정렬 옵션 -->
      <div class="border-t pt-3 flex justify-between items-center">
        <button 
          class="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-1"
          @click="isFilterOpen = !isFilterOpen"
        >
          <i class="fas fa-sliders-h"></i>
          <span>필터</span>
        </button>
        
        <div class="flex space-x-2">
          <select v-model="sortOption" @change="applySortOption" class="border px-2 py-1 rounded">
            <option value="createdAt,desc">최신순</option>
            <option value="price,asc">낮은 가격순</option>
            <option value="price,desc">높은 가격순</option>
          </select>
        </div>
      </div>
      
      <!-- 필터 패널 -->
      <div v-if="isFilterOpen" class="mt-4 p-4 border rounded-lg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-medium">상세 필터</h3>
          <button @click="isFilterOpen = false">
            <i class="fas fa-times text-gray-500"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <!-- 가격 범위 -->
          <div>
            <h4 class="text-sm font-medium mb-2">가격 범위</h4>
            <div class="flex items-center space-x-2">
              <input
                v-model="priceRange.min"
                type="number"
                placeholder="최소 가격"
                class="border rounded-lg px-3 py-1.5 w-full"
              />
              <span>-</span>
              <input
                v-model="priceRange.max"
                type="number"
                placeholder="최대 가격"
                class="border rounded-lg px-3 py-1.5 w-full"
              />
            </div>
          </div>
          
          <!-- 상품 상태 -->
          <div>
            <h4 class="text-sm font-medium mb-2">상품 상태</h4>
            <div class="flex space-x-2">
              <button
                @click="selectedStatus = 'ACTIVE'"
                :class="[
                  'px-3 py-1.5 rounded-lg',
                  selectedStatus === 'ACTIVE' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                ]"
              >
                판매중
              </button>
              <button
                @click="selectedStatus = 'SOLD_OUT'"
                :class="[
                  'px-3 py-1.5 rounded-lg',
                  selectedStatus === 'SOLD_OUT' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                ]"
              >
                품절
              </button>
            </div>
          </div>
          
          <div class="pt-2">
            <button 
              @click="applyFilters"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
      sortOption: 'createdAt,desc' // 기본값 최신순
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
      this.sortOption = 'createdAt,desc';
      this.$emit('reset');
    }
  }
}
</script>
