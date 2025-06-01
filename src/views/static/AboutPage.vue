<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <main class="py-8">
      <div class="container mx-auto px-4 max-w-3xl">
        <h1 class="text-3xl font-bold mb-6">소개</h1>
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <p class="mb-4">FreeMarket는 대학생들을 위한 중고 거래 플랫폼입니다.</p>
          <p class="mb-4">안전하고 편리한 거래 환경을 제공하여 대학생들이 필요한 물건을 쉽게 사고 팔 수 있도록 지원합니다.</p>
          <p>더 나은 서비스 제공을 위해 항상 노력하겠습니다.</p>
        </div>
      </div>
    </main>
    
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'

export default {
  name: 'AboutPage',
  
  components: {
    AppHeader,
    AppFooter
  }
}
</script>
