<template>
  <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
    <div class="container mx-auto px-4 py-12 md:py-16">
      <div class="md:flex md:items-center md:justify-between">
        <div class="md:w-1/2 mb-8 md:mb-0">
          <h1 class="text-3xl md:text-4xl font-bold mb-4">
            대학생을 위한<br />중고 거래 플랫폼
          </h1>
          <p class="text-lg md:text-xl mb-6 text-blue-100">
            필요한 물건을 쉽고 안전하게 거래하세요.<br />
            학업에 필요한 교재부터 생활용품까지 모두 FreeMarket에서!
          </p>
          <div class="flex space-x-4">
            <router-link 
              to="/products" 
              class="px-6 py-3 bg-white text-blue-800 font-bold rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              <i class="fas fa-search mr-2"></i>
              상품 둘러보기
            </router-link>
            <router-link 
              to="/sell" 
              class="px-6 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors inline-flex items-center"
            >
              <i class="fas fa-tag mr-2"></i>
              판매하기
            </router-link>
          </div>
        </div>
        <div class="md:w-1/2 relative">
          <div class="bg-blue-500 p-6 rounded-lg shadow-lg">
            <p class="font-bold text-xl mb-2">안전하고 빠른 거래</p>
            <p>중개 수수료 없음</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppBanner'
}
</script>

<style scoped>
@media (max-width: 768px) {
  .md\:w-1\/2 {
    width: 100%;
  }
  
  .md\:flex {
    flex-direction: column;
  }
}
</style>
