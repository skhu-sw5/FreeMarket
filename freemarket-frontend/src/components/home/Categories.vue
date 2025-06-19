<template>
  <section class="py-8 bg-white dark:bg-surface-dark transition-colors duration-300">
    <div class="container mx-auto px-4">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">카테고리</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
        <router-link 
          v-for="category in categories"
          :key="category.id"
          :to="{ name: 'ProductList', query: { category: category.id } }"
          class="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all hover:bg-primary/5 dark:hover:bg-primary-light/5 hover:scale-105 transform duration-300 border border-gray-100 dark:border-gray-700"
        >
          <div class="w-12 h-12 flex items-center justify-center mb-3 bg-primary/10 dark:bg-primary-light/10 rounded-full text-2xl">
            {{ category.icon }}
          </div>
          <span class="text-sm text-center font-medium text-gray-700 dark:text-gray-300">{{ category.name }}</span>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'AppCategories',
  
  data() {
    return {
      categories: [
        { id: 'BOOKS', name: '교재/서적', icon: '📚' },
        { id: 'ELECTRONICS', name: '전자기기', icon: '📱' },
        { id: 'FASHION', name: '의류/패션', icon: '👔' },
        { id: 'BEAUTY', name: '화장품/미용', icon: '💄' },
        { id: 'SPORTS', name: '스포츠/레저', icon: '⚽' },
        { id: 'HOUSEHOLD', name: '생활용품', icon: '🏠' },
        { id: 'HOBBY', name: '취미/게임', icon: '🎮' },
        { id: 'OTHERS', name: '기타', icon: '🔍' },
      ]
    }
  }
}
</script>

<style scoped>
@media (max-width: 640px) {
  .grid-cols-8 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .grid-cols-8 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
