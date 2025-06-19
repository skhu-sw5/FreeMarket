<template>
  <footer class="bg-gray-800 dark:bg-gray-900 text-white mt-auto transition-colors duration-300">
    <div class="container mx-auto px-4 py-8">
      <div class="md:flex md:justify-between">
        <div class="mb-6 md:mb-0">
          <h2 class="text-xl font-bold mb-4 text-primary-light dark:text-primary-light">FreeMarket</h2>
          <p class="text-gray-400 dark:text-gray-300 mb-4">대학생을 위한 중고 거래 플랫폼</p>
        </div>
        
        <div class="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h3 class="text-sm font-semibold text-gray-400 dark:text-gray-300 tracking-wider uppercase mb-4">서비스</h3>
            <ul class="space-y-2">
              <li><router-link to="/about" class="text-gray-300 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-light transition-colors duration-200">소개</router-link></li>
              <li><router-link to="/terms" class="text-gray-300 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-light transition-colors duration-200">이용약관</router-link></li>
              <li><router-link to="/privacy" class="text-gray-300 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-light transition-colors duration-200">개인정보처리방침</router-link></li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-sm font-semibold text-gray-400 dark:text-gray-300 tracking-wider uppercase mb-4">고객지원</h3>
            <ul class="space-y-2">
              <li><router-link to="/faq" class="text-gray-300 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-light transition-colors duration-200">자주 묻는 질문</router-link></li>
              <li><router-link to="/contact" class="text-gray-300 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-light transition-colors duration-200">문의하기</router-link></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="mt-8 pt-8 border-t border-gray-700 dark:border-gray-600 md:flex md:items-center md:justify-between">
        <p class="text-sm text-gray-400 dark:text-gray-300">
          &copy; {{ new Date().getFullYear() }} FreeMarket. All rights reserved.
        </p>
        <div class="mt-4 md:mt-0 flex space-x-6">
          <a href="#" class="text-gray-400 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-light transition-colors duration-200">
            <span class="sr-only">Facebook</span>
            <i class="fab fa-facebook-f"></i>
          </a>
          <a href="#" class="text-gray-400 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-light transition-colors duration-200">
            <span class="sr-only">Instagram</span>
            <i class="fab fa-instagram"></i>
          </a>
          <a href="#" class="text-gray-400 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-light transition-colors duration-200">
            <span class="sr-only">Twitter</span>
            <i class="fab fa-twitter"></i>
          </a>
          <a href="#" class="text-gray-400 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-light transition-colors duration-200">
            <span class="sr-only">GitHub</span>
            <i class="fab fa-github"></i>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
footer {
  width: 100%;
  margin-top: auto;
}

/* 링크 호버 효과 */
a {
  transition: color 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
}

a i {
  font-size: 1.25rem;
  width: 1.5rem;
  text-align: center;
}

/* 반응형 조정 */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem;
  }
  
  .md\:flex {
    flex-direction: column;
  }
  
  .md\:justify-between {
    justify-content: flex-start;
  }
  
  .md\:items-center {
    align-items: flex-start;
  }
  
  .md\:mt-0 {
    margin-top: 1rem;
  }
}

/* 다크 모드 대응 */
@media (prefers-color-scheme: dark) {
  footer {
    background-color: #1f2937;
  }
  
  .border-gray-700 {
    border-color: #374151;
  }
  
  .text-gray-400 {
    color: #9ca3af;
  }
  
  .text-gray-300 {
    color: #d1d5db;
  }
  
  .hover\:text-white:hover {
    color: #ffffff;
  }
}
</style>
