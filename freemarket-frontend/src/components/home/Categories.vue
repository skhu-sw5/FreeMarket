<template>
  <section class="py-8 bg-white">
    <div class="container mx-auto px-4">
      <h2 class="text-2xl font-bold mb-6">카테고리</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
        <router-link 
          v-for="category in categories"
          :key="category.id"
          :to="{ name: 'ProductList', query: { category: category.id } }"
          class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all hover:bg-blue-50 hover:scale-105 transform duration-200"
        >
          <div class="w-12 h-12 flex items-center justify-center mb-3 bg-blue-100 rounded-full text-2xl text-blue-600">
            {{ category.icon }}
          </div>
          <span class="text-sm text-center font-medium">{{ category.name }}</span>
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
