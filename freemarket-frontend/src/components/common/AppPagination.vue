<template>
  <div class="flex justify-center mt-8">
    <nav class="flex items-center space-x-1">
      <button
        @click="$emit('page-change', currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
      >
        이전
      </button>
      
      <button
        v-for="number in displayedPageNumbers"
        :key="number"
        @click="$emit('page-change', number)"
        :class="[
          'px-3 py-1 rounded',
          currentPage === number 
            ? 'bg-blue-600 text-white' 
            : 'border border-gray-300'
        ]"
      >
        {{ number }}
      </button>
      
      <button
        @click="$emit('page-change', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
      >
        다음
      </button>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'AppPagination',
  
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true,
      default: 1
    },
    totalItems: {
      type: Number,
      default: 0
    },
    itemsPerPage: {
      type: Number,
      default: 10
    }
  },
  
  computed: {
    displayedPageNumbers() {
      const pageNumbers = []
      
      // 최대 5개의 페이지 번호를 표시
      const calculatedTotalPages = this.totalPages || Math.ceil(this.totalItems / this.itemsPerPage) || 1;
      
      let startPage = Math.max(1, this.currentPage - 2)
      let endPage = Math.min(calculatedTotalPages, startPage + 4)
      
      if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4)
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
      
      return pageNumbers
    }
  }
}
</script>
