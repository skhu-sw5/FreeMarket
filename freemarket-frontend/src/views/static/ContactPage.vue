<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <main class="py-8">
      <div class="container mx-auto px-4 max-w-3xl">
        <h1 class="text-3xl font-bold mb-6">문의하기</h1>
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <p class="mb-4">이 페이지는 문의하기 페이지입니다.</p>
          <p>자세한 문의 방법이 여기에 표시됩니다.</p>
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
  name: 'ContactPage',
  
  components: {
    AppHeader,
    AppFooter
  }
}
</script>
