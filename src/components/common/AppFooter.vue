<template>
  <footer class="bg-gray-800 text-white">
    <div class="container mx-auto px-4 py-8">
      <div class="md:flex md:justify-between">
        <div class="mb-6 md:mb-0">
          <h2 class="text-xl font-bold mb-4">FreeMarket</h2>
          <p class="text-gray-400 mb-4">대학생을 위한 중고 거래 플랫폼</p>
        </div>
        
        <div class="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">서비스</h3>
            <ul class="space-y-2">
              <li><router-link to="/about" class="text-gray-300 hover:text-white">소개</router-link></li>
              <li><router-link to="/terms" class="text-gray-300 hover:text-white">이용약관</router-link></li>
              <li><router-link to="/privacy" class="text-gray-300 hover:text-white">개인정보처리방침</router-link></li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">고객지원</h3>
            <ul class="space-y-2">
              <li><router-link to="/faq" class="text-gray-300 hover:text-white">자주 묻는 질문</router-link></li>
              <li><router-link to="/contact" class="text-gray-300 hover:text-white">문의하기</router-link></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="mt-8 pt-8 border-t border-gray-700 md:flex md:items-center md:justify-between">
        <p class="text-sm text-gray-400">
          &copy; {{ new Date().getFullYear() }} FreeMarket. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>
