<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <main class="py-8">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <!-- 페이지 제목 -->
          <div class="mb-6">
            <h1 class="text-2xl font-bold">주문 내역</h1>
            <p class="text-gray-600">지금까지 진행한 구매와 판매 내역을 확인하세요.</p>
          </div>
          
          <!-- 탭 네비게이션 -->
          <div class="bg-white rounded-lg shadow-sm mb-6">
            <div class="flex border-b">
              <button 
                class="px-6 py-3 font-medium focus:outline-none"
                :class="activeTab === 'purchases' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'"
                @click="activeTab = 'purchases'"
              >
                구매 내역
              </button>
              <button 
                class="px-6 py-3 font-medium focus:outline-none"
                :class="activeTab === 'sales' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'"
                @click="activeTab = 'sales'"
              >
                판매 내역
              </button>
            </div>
          </div>
          
          <!-- 로딩 상태 -->
          <div v-if="loading" class="bg-white rounded-lg shadow-sm p-6">
            <div class="animate-pulse space-y-4">
              <div class="h-8 bg-gray-200 rounded"></div>
              <div class="h-32 bg-gray-200 rounded"></div>
              <div class="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          <!-- 에러 메시지 -->
          <div v-else-if="error" class="bg-white rounded-lg shadow-sm p-6">
            <div class="bg-red-50 border-l-4 border-red-500 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <i class="fas fa-exclamation-circle text-red-500"></i>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-red-700">{{ error }}</p>
                  <p class="text-sm text-gray-600 mt-1">
                    백엔드 서버나 네트워크 연결에 문제가 있을 수 있습니다.
                  </p>
                  <div class="mt-2">
                    <button 
                      @click="fetchOrders()" 
                      class="text-sm text-red-700 hover:text-red-600 font-medium"
                    >
                      다시 시도
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 구매 내역 탭 -->
          <div v-else-if="activeTab === 'purchases' && !loading">
            <div v-if="purchases.length === 0" class="bg-white rounded-lg shadow-sm p-8 text-center">
              <div class="mb-4">
                <i class="fas fa-shopping-bag text-gray-300 text-5xl"></i>
              </div>
              <h2 class="text-xl font-medium mb-2">구매 내역이 없습니다</h2>
              <p class="text-gray-600 mb-6">아직 구매하신 상품이 없습니다.</p>
              <router-link 
                to="/products" 
                class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                상품 둘러보기
              </router-link>
            </div>
            
            <div v-else class="space-y-4">
              <div 
                v-for="order in purchases" 
                :key="order.id" 
                class="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
                  <div>
                    <span class="text-sm text-gray-500">주문번호: {{ order.id }}</span>
                    <span class="mx-2 text-gray-300">|</span>
                    <span class="text-sm text-gray-500">{{ formatDate(order.createdAt) }}</span>
                  </div>
                  <span 
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="getOrderStatusClass(order.status)"
                  >
                    {{ getOrderStatusText(order.status) }}
                  </span>
                </div>
                
                <div class="p-4 flex items-center">
                  <div class="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img 
                      v-if="order.product && order.product.imageUrls && order.product.imageUrls.length" 
                      :src="order.product.imageUrls[0]" 
                      alt="상품 이미지" 
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <i class="fas fa-box text-gray-400"></i>
                    </div>
                  </div>
                  
                  <div class="ml-4 flex-grow">
                    <router-link 
                      :to="{ name: 'ProductDetail', params: { id: order.product.id } }"
                      class="font-medium hover:text-blue-600"
                    >
                      {{ order.product.name }}
                    </router-link>
                    <p class="text-gray-600 text-sm">수량: {{ order.quantity }}개</p>
                    <p class="text-gray-600 text-sm">판매자: {{ order.product.sellerName }}</p>
                  </div>
                  
                  <div class="ml-4 text-right">
                    <p class="font-medium">{{ formatPrice(order.totalAmount) }}원</p>
                  </div>
                </div>
                
                <div class="p-3 border-t bg-gray-50 flex justify-end space-x-3">
                  <router-link 
                    :to="{ name: 'OrderComplete', params: { id: order.id } }"
                    class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                  >
                    주문 상세
                  </router-link>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 판매 내역 탭 -->
          <div v-else-if="activeTab === 'sales' && !loading">
            <div v-if="sales.length === 0" class="bg-white rounded-lg shadow-sm p-8 text-center">
              <div class="mb-4">
                <i class="fas fa-store text-gray-300 text-5xl"></i>
              </div>
              <h2 class="text-xl font-medium mb-2">판매 내역이 없습니다</h2>
              <p class="text-gray-600 mb-6">아직 판매된 상품이 없습니다.</p>
              <router-link 
                to="/sell" 
                class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                상품 등록하러 가기
              </router-link>
            </div>
            
            <div v-else class="space-y-4">
              <div 
                v-for="order in sales" 
                :key="order.id" 
                class="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
                  <div>
                    <span class="text-sm text-gray-500">주문번호: {{ order.id }}</span>
                    <span class="mx-2 text-gray-300">|</span>
                    <span class="text-sm text-gray-500">{{ formatDate(order.createdAt) }}</span>
                  </div>
                  <span 
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="getOrderStatusClass(order.status)"
                  >
                    {{ getOrderStatusText(order.status) }}
                  </span>
                </div>
                
                <div class="p-4 flex items-center">
                  <div class="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img 
                      v-if="order.product && order.product.imageUrls && order.product.imageUrls.length" 
                      :src="order.product.imageUrls[0]" 
                      alt="상품 이미지" 
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <i class="fas fa-box text-gray-400"></i>
                    </div>
                  </div>
                  
                  <div class="ml-4 flex-grow">
                    <router-link 
                      :to="{ name: 'ProductDetail', params: { id: order.product.id } }"
                      class="font-medium hover:text-blue-600"
                    >
                      {{ order.product.name }}
                    </router-link>
                    <p class="text-gray-600 text-sm">수량: {{ order.quantity }}개</p>
                    <p class="text-gray-600 text-sm">구매자: {{ order.buyerName || '(비공개)' }}</p>
                  </div>
                  
                  <div class="ml-4 text-right">
                    <p class="font-medium">{{ formatPrice(order.totalAmount) }}원</p>
                  </div>
                </div>
                
                <div class="p-3 border-t bg-gray-50 flex justify-end space-x-3">
                  <button
                    v-if="order.status === 'PENDING' || order.status === 'PAID'" 
                    @click="updateOrderStatus(order.id, 'SHIPPING')"
                    class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    배송 시작
                  </button>
                  <button
                    v-if="order.status === 'SHIPPING'" 
                    @click="updateOrderStatus(order.id, 'DELIVERED')"
                    class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    배송 완료
                  </button>
                </div>
              </div>
            </div>
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
  name: 'UserOrders',
  
  components: {
    AppHeader,
    AppFooter
  },
  
  data() {
    return {
      activeTab: 'purchases',
      purchases: [],
      sales: [],
      loading: false,
      error: null
    }
  },
  
  computed: {
    ...mapState('auth', ['isAuthenticated']),
    // 토큰은 localStorage에서 직접 가져옴
    token() {
      return localStorage.getItem('accessToken') || ''
    }
  },
  
  created() {
    if (!this.isAuthenticated) {
      this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
    } else {
      this.fetchOrders()
    }
  },
  
  methods: {
    async fetchOrders() {
      this.loading = true
      this.error = null
      
      try {
        // axios 가져오기
        const axios = (await import('axios')).default
        // 더미 데이터 가져오기 (개발용)
        const { dummyPurchases, dummySales, isDevelopment } = await import('@/utils/dummyData')
        
        // 디버깅을 위한 로깅
        console.log('주문 내역 조회 시작...')
        
        // 구매 내역 가져오기
        let purchasesData = []
        try {
          const purchasesResponse = await axios.get('/api/orders', {
            params: { type: 'purchases' },
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          })
          
          console.log('구매 내역 응답:', purchasesResponse)
          purchasesData = purchasesResponse.data.data || []
        } catch (purchaseError) {
          console.warn('구매 내역 조회 실패:', purchaseError)
          
          // 개발 환경에서는 더미 데이터 사용
          if (isDevelopment()) {
            console.log('개발 환경에서 더미 구매 내역 데이터 사용')
            purchasesData = dummyPurchases
          }
        }
        
        this.purchases = purchasesData
        
        // 판매 내역 가져오기
        let salesData = []
        try {
          const salesResponse = await axios.get('/api/orders', {
            params: { type: 'sales' },
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          })
          
          console.log('판매 내역 응답:', salesResponse)
          salesData = salesResponse.data.data || []
        } catch (saleError) {
          console.warn('판매 내역 조회 실패:', saleError)
          
          // 개발 환경에서는 더미 데이터 사용
          if (isDevelopment()) {
            console.log('개발 환경에서 더미 판매 내역 데이터 사용')
            salesData = dummySales
          }
        }
        
        this.sales = salesData
        
        // 양쪽 다 실패한 경우만 에러 표시 (더미 데이터도 없는 경우)
        if (this.purchases.length === 0 && this.sales.length === 0) {
          this.error = "주문 내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
        }
        
      } catch (error) {
        console.error('주문 내역 조회 오류:', error)
        this.error = error.response?.data?.message || error.message || "서버 내부 오류가 발생했습니다."
      } finally {
        this.loading = false
      }
    },
    
    async updateOrderStatus(orderId, newStatus) {
      try {
        // axios 가져오기
        const axios = (await import('axios')).default
        
        const response = await axios.patch(`/api/orders/${orderId}/status`, 
          { status: newStatus },
          { 
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          }
        )
        
        // 주문 목록 새로고침
        this.fetchOrders()
        
        if (this.$toast) {
          this.$toast.success('주문 상태가 업데이트되었습니다.')
        } else {
          alert('주문 상태가 업데이트되었습니다.')
        }
      } catch (error) {
        console.error('주문 상태 업데이트 오류:', error)
        
        const errorMessage = error.response?.data?.message || error.message || '주문 상태 업데이트에 실패했습니다.'
        
        if (this.$toast) {
          this.$toast.error(errorMessage)
        } else {
          alert(errorMessage)
        }
      }
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('ko-KR').format(price || 0)
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      }).format(date)
    },
    
    getOrderStatusText(status) {
      const statusMap = {
        'PENDING': '결제 대기',
        'PAID': '결제 완료',
        'SHIPPING': '배송 중',
        'DELIVERED': '배송 완료',
        'CANCELLED': '주문 취소'
      }
      
      return statusMap[status] || status
    },
    
    getOrderStatusClass(status) {
      const classMap = {
        'PENDING': 'bg-yellow-100 text-yellow-800',
        'PAID': 'bg-blue-100 text-blue-800',
        'SHIPPING': 'bg-purple-100 text-purple-800',
        'DELIVERED': 'bg-green-100 text-green-800',
        'CANCELLED': 'bg-red-100 text-red-800'
      }
      
      return classMap[status] || 'bg-gray-100 text-gray-800'
    }
  }
}
</script> 
