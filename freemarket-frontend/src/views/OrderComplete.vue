<template>
  <div class="min-h-screen bg-gray-50 dark:bg-background-dark transition-colors duration-300">
    <AppHeader />
    
    <main class="py-8">
      <div class="container mx-auto px-4 max-w-3xl">
        <div class="card text-center">
          <div class="mb-6">
            <div class="h-20 w-20 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
              <i class="fas fa-check text-3xl"></i>
            </div>
          </div>
          
          <h1 class="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">주문이 완료되었습니다!</h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6">주문번호: {{ order.id }}</p>
          
          <div v-if="loading" class="animate-pulse space-y-4 mb-6">
            <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
          
          <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6">
            <p class="text-red-600 dark:text-red-400">{{ error }}</p>
          </div>
          
          <div v-else-if="order" class="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden mb-8">
            <div class="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-600">
              <h2 class="font-medium text-gray-800 dark:text-gray-100">주문 상세 정보</h2>
            </div>
            
            <div class="p-6">
              <div class="flex items-center mb-6">
                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                  <img 
                    v-if="order.product && order.product.imageUrls && order.product.imageUrls.length" 
                    :src="order.product.imageUrls[0]" 
                    alt="상품 이미지" 
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <i class="fas fa-box text-gray-400 dark:text-gray-500"></i>
                  </div>
                </div>
                
                <div class="ml-4">
                  <h3 class="font-medium text-gray-800 dark:text-gray-100">{{ order.product ? order.product.name : '상품 정보 없음' }}</h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">수량: {{ order.quantity }}개</p>
                </div>
                
                <div class="ml-auto">
                  <p class="font-medium text-gray-800 dark:text-gray-100">{{ formatPrice(order.totalAmount) }}원</p>
                </div>
              </div>
              
              <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
                <div class="flex justify-between mb-2">
                  <span class="text-gray-600 dark:text-gray-400">주문일시</span>
                  <span class="text-gray-800 dark:text-gray-100">{{ formatDate(order.createdAt) }}</span>
                </div>
                <div class="flex justify-between mb-2">
                  <span class="text-gray-600 dark:text-gray-400">주문상태</span>
                  <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-xs">{{ orderStatusText }}</span>
                </div>
                <div class="flex justify-between mb-2">
                  <span class="text-gray-600 dark:text-gray-400">결제방법</span>
                  <span class="text-gray-800 dark:text-gray-100">계좌이체</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">판매자</span>
                  <span class="text-gray-800 dark:text-gray-100">{{ order.product ? order.product.sellerName : '-' }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <router-link to="/" class="button-outline">
              홈으로 돌아가기
            </router-link>
            <router-link to="/user/orders" class="button-primary">
              내 주문 목록 보기
            </router-link>
          </div>
        </div>
      </div>
    </main>
    
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import { mapState } from 'vuex'

export default {
  name: 'OrderComplete',
  
  components: {
    AppHeader,
    AppFooter
  },
  
  data() {
    return {
      order: null,
      loading: true,
      error: null
    }
  },
  
  computed: {
    ...mapState('auth', ['isAuthenticated', 'token']),
    
    orderId() {
      return this.$route.params.id
    },
    
    orderStatusText() {
      if (!this.order) return '-'
      
      const statusMap = {
        'PENDING': '결제 대기',
        'PAID': '결제 완료',
        'SHIPPING': '배송 중',
        'DELIVERED': '배송 완료',
        'CANCELLED': '주문 취소'
      }
      
      return statusMap[this.order.status] || this.order.status
    }
  },
  
  created() {
    if (!this.isAuthenticated) {
      this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
    } else {
      this.fetchOrder()
    }
  },
  
  methods: {
    async fetchOrder() {
      this.loading = true
      this.error = null
      
      try {
        if (!this.orderId) {
          throw new Error('주문 ID가 제공되지 않았습니다.')
        }
        
        const response = await fetch(`/api/orders/${this.orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          }
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || `주문 정보를 불러올 수 없습니다. (${response.status})`)
        }
        
        const data = await response.json()
        this.order = data.data
      } catch (error) {
        console.error('주문 정보 조회 오류:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('ko-KR').format(price || 0)
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      
      const date = new Date(dateString)
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }
      
      return new Intl.DateTimeFormat('ko-KR', options).format(date)
    }
  }
}
</script> 