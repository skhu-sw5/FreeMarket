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
            
            <!-- 페이지네이션 -->
            <div class="flex justify-center mt-6">
              <button 
                @click="handlePageChange(purchasesPagination.currentPage - 1, 'purchases')" 
                :disabled="purchasesPagination.currentPage === 0" 
                class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                이전
              </button>
              <button 
                v-for="page in purchasesPagination.totalPages" 
                :key="page" 
                @click="handlePageChange(page, 'purchases')" 
                :class="{'bg-blue-600 text-white': purchasesPagination.currentPage === page - 1}" 
                class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                {{ page }}
              </button>
              <button 
                @click="handlePageChange(purchasesPagination.currentPage + 1, 'purchases')" 
                :disabled="purchasesPagination.currentPage === purchasesPagination.totalPages - 1" 
                class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                다음
              </button>
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
            
            <!-- 페이지네이션 -->
            <div class="flex justify-center mt-6">
              <button 
                @click="handlePageChange(salesPagination.currentPage - 1, 'sales')" 
                :disabled="salesPagination.currentPage === 0" 
                class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                이전
              </button>
              <button 
                v-for="page in salesPagination.totalPages" 
                :key="page" 
                @click="handlePageChange(page, 'sales')" 
                :class="{'bg-blue-600 text-white': salesPagination.currentPage === page - 1}" 
                class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                {{ page }}
              </button>
              <button 
                @click="handlePageChange(salesPagination.currentPage + 1, 'sales')" 
                :disabled="salesPagination.currentPage === salesPagination.totalPages - 1" 
                class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                다음
              </button>
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
import { mapState, mapActions } from 'vuex'
import { apiGet } from '@/utils/api'

export default {
  name: 'OrdersPage',
  
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
      error: null,
      purchasesPagination: {
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        size: 10
      },
      salesPagination: {
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        size: 10
      }
    }
  },
  
  computed: {
    ...mapState('auth', ['isAuthenticated', 'token', 'user']),
  },
  
  created() {
    if (!this.isAuthenticated) {
      this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
    } else {
      // 초기 로딩 시 에러 방지를 위한 타임아웃 설정
      setTimeout(() => {
        this.fetchOrders()
      }, 500)
    }
  },
  
  watch: {
    activeTab() {
      this.error = null;
      if (this.activeTab === 'purchases' && this.purchases.length === 0) {
        this.fetchPurchases();
      } else if (this.activeTab === 'sales' && this.sales.length === 0) {
        this.fetchSales();
      }
    }
  },
  
  methods: {
    async fetchOrders() {
      this.loading = true;
      this.error = null;
      
      try {
        // 순차적으로 데이터를 가져와서 한쪽이 실패해도 다른 쪽이 로드되도록 함
        try {
          await this.fetchPurchases();
        } catch (purchaseError) {
          console.error('구매 내역 조회 실패:', purchaseError);
          if (this.activeTab === 'purchases') {
            this.error = purchaseError.message || "구매 내역을 불러오지 못했습니다.";
          }
        }
        
        try {
          await this.fetchSales();
        } catch (salesError) {
          console.error('판매 내역 조회 실패:', salesError);
          if (this.activeTab === 'sales') {
            this.error = salesError.message || "판매 내역을 불러오지 못했습니다.";
          }
        }
      } catch (error) {
        console.error('주문 내역 조회 오류:', error);
        this.error = "주문 내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
      } finally {
        this.loading = false;
      }
    },
    
    async fetchPurchases(page = 0) {
      try {
        // 공통 API 유틸리티 사용
        const apiUrl = `/api/users/profile/me/purchases?page=${page}&size=${this.purchasesPagination.size}`;
        console.log('구매 내역 API 호출:', apiUrl);
        
        const response = await apiGet(apiUrl, {
          handleError: (status) => {
            console.log(`구매 내역 조회 오류 상태 코드: ${status}`);
            return true; // 기본 오류 처리 진행
          }
        });
        
        console.log('구매 내역 응답 데이터:', response);
        
        if (response && response.data) {
          // 데이터가 올바르게 존재하는지 확인 후 처리
          const purchaseItems = response.data.content || [];
          
          // 응답 데이터 구조 확인 및 변환
          this.purchases = purchaseItems.map(item => {
            // product 객체가 없는 경우 기본 객체 제공
            if (!item.product) {
              console.warn('구매 항목에 product 객체가 없음:', item);
              item.product = {
                id: item.id || 0,
                name: '상품 정보 없음',
                imageUrls: [],
                price: 0,
                sellerName: '판매자 정보 없음'
              };
            }
            return item;
          });
          
          this.purchasesPagination = {
            currentPage: response.data.number || 0,
            totalPages: response.data.totalPages || 0,
            totalElements: response.data.totalElements || 0,
            size: response.data.size || 10
          };
          
          // 성공 시 에러 메시지 초기화
          if (this.activeTab === 'purchases') {
            this.error = null;
          }
        } else {
          console.warn('API 응답에 data 객체가 없습니다:', response);
          throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        console.error('구매 내역 조회 오류:', error);
        if (this.activeTab === 'purchases') {
          this.error = error.message || "구매 내역을 불러오지 못했습니다.";
        }
        // 빈 배열로 초기화하여 UI 오류 방지
        this.purchases = [];
      }
    },
    
    async fetchSales(page = 0) {
      try {
        // 공통 API 유틸리티 사용
        const apiUrl = `/api/users/profile/selling?page=${page}&size=${this.salesPagination.size}`;
        console.log('판매 내역 API 호출:', apiUrl);
        
        const response = await apiGet(apiUrl, {
          handleError: (status) => {
            console.log(`판매 내역 조회 오류 상태 코드: ${status}`);
            return true; // 기본 오류 처리 진행
          }
        });
        
        console.log('판매 내역 응답 데이터:', response);
        
        if (response && response.data) {
          // API 응답 구조에 맞게 처리
          // 응답은 { activeProducts: [...], soldProducts: [...], totalProductCount: N } 형태
          
          // 판매 완료된 상품 목록 가져오기 (요구사항에 맞게)
          const soldProducts = response.data.soldProducts || [];
          console.log('판매 완료된 상품 수:', soldProducts.length);
          
          // 각 상품을 orders.vue 템플릿에서 사용하는 형식으로 변환
          this.sales = soldProducts.map(item => ({
            id: item.productId,
            createdAt: item.soldDate || item.createdDate,
            status: 'SOLD_OUT', // 판매 완료 상태로 설정
            product: {
              id: item.productId,
              name: item.name,
              price: item.price,
              category: item.category,
              status: 'SOLD_OUT',
              imageUrls: item.thumbnailUrl ? [item.thumbnailUrl] : [],
              sellerName: this.user ? this.user.name : '판매자'
            },
            buyer: {
              name: item.buyerName || '구매자'
            },
            quantity: 1,
            totalAmount: item.price
          }));
          
          console.log('변환된 판매 내역:', this.sales);
          
          this.salesPagination = {
            currentPage: page,
            totalPages: Math.ceil(response.data.totalProductCount / this.salesPagination.size) || 1,
            totalElements: response.data.totalProductCount || 0,
            size: this.salesPagination.size
          };
          
          // 성공 시 에러 메시지 초기화
          if (this.activeTab === 'sales') {
            this.error = null;
          }
        } else {
          console.warn('API 응답에 data 객체가 없습니다:', response);
          throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        console.error('판매 내역 조회 오류:', error);
        if (this.activeTab === 'sales') {
          this.error = error.message || "판매 내역을 불러오지 못했습니다.";
        }
        // 빈 배열로 초기화하여 UI 오류 방지
        this.sales = [];
      }
    },
    
    handlePageChange(page, type) {
      if (type === 'purchases') {
        this.fetchPurchases(page - 1);
      } else if (type === 'sales') {
        this.fetchSales(page - 1);
      }
    },
    
    async updateOrderStatus(orderId, newStatus) {
      try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
          throw new Error(`주문 상태 업데이트에 실패했습니다. 상태 코드: ${response.status}`);
        }
        
        if (this.activeTab === 'purchases') {
          this.fetchPurchases();
        } else {
          this.fetchSales();
        }
        
        alert('주문 상태가 업데이트되었습니다.');
      } catch (error) {
        console.error('주문 상태 업데이트 오류:', error);
        alert(error.message || '주문 상태 업데이트에 실패했습니다.');
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
