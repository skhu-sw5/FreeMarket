<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <main class="py-6">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold">내 판매 상품 관리</h1>
            <p class="text-sm text-gray-600 mt-1">상품을 우클릭하면 수정, 삭제, 판매완료 처리를 할 수 있습니다.</p>
          </div>
          <router-link 
            to="/sell" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <i class="fas fa-plus"></i>
            <span>새 상품 등록</span>
          </router-link>
        </div>
        
        <!-- 필터 탭 -->
        <div class="bg-white rounded-lg shadow-sm mb-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                v-for="tab in filterTabs"
                :key="tab.key"
                @click="activeFilter = tab.key"
                :class="[
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                  activeFilter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                {{ tab.name }} ({{ getFilteredProducts(tab.key).length }})
              </button>
            </nav>
          </div>
        </div>
        
        <!-- 로딩 상태 -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="n in 6" :key="n" class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="animate-pulse">
              <div class="aspect-square bg-gray-200"></div>
              <div class="p-4 space-y-3">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded w-2/3"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 상품 목록 -->
        <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="product in filteredProducts" 
            :key="product.product.id"
            @contextmenu.prevent="showContextMenu($event, product.product)"
            class="relative"
          >
            <MyProductCard 
              :product="product.product"
              :stats="product.stats"
              @click="goToProduct"
              @wishlist-toggle="handleWishlistToggle"
            />
          </div>
        </div>
        
        <!-- 컨텍스트 메뉴 -->
        <div 
          v-if="contextMenu.show" 
          :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
          class="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[160px]"
          @click="hideContextMenu"
        >
          <button
            @click="editProduct(contextMenu.product.id)"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
          >
            <i class="fas fa-edit text-blue-500"></i>
            <span>수정</span>
          </button>
          <button
            @click="deleteProductItem(contextMenu.product.id)"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
          >
            <i class="fas fa-trash-alt text-red-500"></i>
            <span>삭제</span>
          </button>
          <hr class="my-1">
          <button
            v-if="isActive(contextMenu.product)"
            @click="markAsSold(contextMenu.product)"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
          >
            <i class="fas fa-check-circle text-green-500"></i>
            <span>판매 완료 처리</span>
          </button>
          <button
            v-if="isSoldOut(contextMenu.product)"
            @click="cancelSold(contextMenu.product)"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
          >
            <i class="fas fa-undo text-yellow-500"></i>
            <span>판매 완료 취소</span>
          </button>
        </div>
        
        <!-- 컨텍스트 메뉴 배경 클릭 감지 -->
        <div 
          v-if="contextMenu.show"
          @click="hideContextMenu"
          class="fixed inset-0 z-40"
        ></div>
        
        <!-- 빈 상태 -->
        <div v-else-if="!loading && filteredProducts.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
          <div class="mb-4">
            <i class="fas fa-box-open text-6xl text-gray-300"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ getEmptyMessage() }}
          </h3>
          <p class="text-gray-500 mb-6">
            {{ getEmptyDescription() }}
          </p>
          <!-- 디버깅 정보 (문제 해결을 위해 임시로 항상 표시) -->
          <div class="text-xs text-gray-400 mb-4 p-2 bg-gray-50 rounded">
            <p>디버깅 정보:</p>
            <p>총 상품 수: {{ myProducts.length }}</p>
            <p>현재 필터: {{ activeFilter }}</p>
            <p>필터된 상품 수: {{ filteredProducts.length }}</p>
            <p>로딩 상태: {{ loading }}</p>
            <p>API 호출 결과: {{ myProducts.length > 0 ? 'SUCCESS' : 'EMPTY' }}</p>
          </div>
          <router-link 
            v-if="activeFilter === 'all'"
            to="/sell" 
            class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <i class="fas fa-plus"></i>
            <span>첫 상품 등록하기</span>
          </router-link>
        </div>
      </div>
    </main>
    
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import MyProductCard from '@/components/products/MyProductCard.vue'
import { mapActions } from 'vuex'
import { apiGet } from '@/utils/api'

export default {
  name: 'MyProductsView',
  
  components: {
    AppHeader,
    AppFooter,
    MyProductCard
  },
  
  data() {
    return {
      loading: true,
      myProducts: [],
      activeFilter: 'all',
      filterTabs: [
        { key: 'all', name: '전체' },
        { key: 'active', name: '판매중' },
        { key: 'sold', name: '판매완료' },
        { key: 'inactive', name: '판매중지' }
      ],
      contextMenu: {
        show: false,
        x: 0,
        y: 0,
        product: null
      }
    }
  },
  
  computed: {
    filteredProducts() {
      return this.getFilteredProducts(this.activeFilter)
    }
  },
  
  async created() {
    // 내 상품 목록 조회에서 조회수 증가를 건너뛰도록 설정
    this.$store.dispatch('products/setSkipViewIncrement', true);
    
    try {
      await this.fetchMyProducts();
      
      // 데이터 로딩 완료 후 상태 확인
      console.log('=== 데이터 로딩 완료 ===');
      console.log('총 상품 수:', this.myProducts.length);
      console.log('현재 필터:', this.activeFilter);
      console.log('필터된 상품 수:', this.filteredProducts.length);
      console.log('로딩 상태:', this.loading);
      
      if (this.myProducts.length > 0) {
        console.log('상품 목록 샘플:', this.myProducts.slice(0, 2));
      }
    } catch (error) {
      console.error('초기 데이터 로딩 실패:', error);
    } finally {
      // 원래 상태로 복원
      this.$store.dispatch('products/setSkipViewIncrement', false);
    }
  },
  
  methods: {
    ...mapActions('products', ['deleteProduct']),
    
    async fetchMyProducts() {
      this.loading = true
      
      try {
        console.log('내 판매 상품 목록 가져오기 요청 시작...')
        
        // 현재 사용자 정보 가져오기
        const currentUser = this.$store.state.auth.user;
        if (!currentUser || !currentUser.id) {
          console.error('현재 사용자 정보가 없습니다.');
          this.myProducts = [];
          return;
        }
        
        // 사용자별 상품 목록 API 사용 (백엔드 UserController.getSellerProducts 엔드포인트)
        // 모든 상태의 상품을 가져오기 위해 status 파라미터 없이 호출
        const data = await apiGet(`/api/users/${currentUser.id}/products`, {
          skipViewIncrement: true
        })
        
        console.log('사용자 상품 목록 API 응답:', data)
        
        if (data && data.success && data.data) {
          this.myProducts = this.processProductData(data.data);
        } else {
          console.warn('응답 데이터가 없거나 성공하지 않음:', data)
          this.myProducts = []
        }
        
        // 데이터 구조 확인 로그
        console.log('최종 처리된 상품 목록:', this.myProducts);
        if (this.myProducts.length > 0) {
          console.log('첫 번째 상품 이미지 정보:', {
            thumbnailUrl: this.myProducts[0].product.thumbnailUrl,
            imageUrls: this.myProducts[0].product.imageUrls
          });
        }
      } catch (error) {
        console.error('내 판매 상품 목록 조회 오류:', error)
        this.myProducts = []
        
        // 사용자에게 오류 알림
        if (this.$toast) {
          this.$toast.error('상품 목록을 불러오는데 실패했습니다. 새로고침을 시도해보세요.')
        }
      } finally {
        this.loading = false
      }
    },
    
    // 상품 데이터 처리 메서드
    processProductData(data) {
      console.log('상품 데이터 처리 시작:', data);
      
      // 1. 페이징 응답인 경우 (content 필드) - Spring Data JPA Page 응답
      if (data.content && Array.isArray(data.content)) {
        console.log('페이징 응답 구조 감지됨');
        
        return data.content.map(product => ({
          product: {
            ...product,
            id: product.id,
            status: product.status || '판매중',
            thumbnailUrl: product.thumbnailUrl,
            imageUrls: product.imageUrls || []
          },
          stats: {
            viewCount: product.viewCount || 0,
            wishlistCount: product.wishlistCount || 0,
            isWishlisted: product.isWishlisted || false
          }
        }));
      }
      
      // 2. 배열 형태인 경우
      else if (Array.isArray(data)) {
        console.log('배열 형태 데이터 감지됨');
        
        return data.map(product => ({
          product: {
            ...product,
            id: product.id,
            status: product.status || '판매중',
            thumbnailUrl: product.thumbnailUrl,
            imageUrls: product.imageUrls || []
          },
          stats: {
            viewCount: product.viewCount || 0,
            wishlistCount: product.wishlistCount || 0,
            isWishlisted: product.isWishlisted || false
          }
        }));
      }
      
      // 3. 판매 내역 구조인 경우 (activeProducts, soldProducts) - 백엔드 SellingHistoryResponse
      else if (data.activeProducts || data.soldProducts) {
        console.log('판매 내역 구조 감지됨');
        
        const activeProducts = (data.activeProducts || []).map(product => ({
          product: {
            ...product,
            id: product.id,
            status: '판매중', // 백엔드에서 한글로 올 수 있음
            thumbnailUrl: product.thumbnailUrl,
            imageUrls: product.imageUrls || []
          },
          stats: { 
            viewCount: product.viewCount || 0,
            wishlistCount: product.wishlistCount || 0,
            isWishlisted: product.isWishlisted || false
          }
        }));
        
        const soldProducts = (data.soldProducts || []).map(product => ({
          product: {
            ...product,
            id: product.id,
            status: '품절', // 백엔드에서 한글로 올 수 있음
            thumbnailUrl: product.thumbnailUrl,
            imageUrls: product.imageUrls || []
          },
          stats: { 
            viewCount: product.viewCount || 0,
            wishlistCount: product.wishlistCount || 0,
            isWishlisted: product.isWishlisted || false
          }
        }));
        
        return [...activeProducts, ...soldProducts];
      }
      
      // 4. 기타 구조
      else {
        console.warn('알 수 없는 데이터 구조:', data);
        return [];
      }
    },
    
    getFilteredProducts(filter) {
      if (!this.myProducts || this.myProducts.length === 0) {
        console.log('상품 목록이 없습니다:', this.myProducts);
        return [];
      }
      
      console.log(`필터 '${filter}' 적용 중... 전체 상품 수: ${this.myProducts.length}`);
      
      // 모든 상품의 상태를 확인해보자
      this.myProducts.forEach((item, index) => {
        console.log(`상품 ${index + 1}: ID=${item.product.id}, 이름=${item.product.name}, 상태=${item.product.status}`);
      });
      
      let filtered = [];
      
      switch (filter) {
        case 'active':
          filtered = this.myProducts.filter(item => {
            const status = item.product.status;
            // 판매중 상태 체크 (한글/영문 모두 고려)
            const isActive = ['ACTIVE', '판매중', 'active'].includes(status) || 
                             (status && status.toLowerCase().includes('active')) ||
                             (!status); // 상태가 없는 경우도 판매중으로 간주
            console.log(`상품 ${item.product.id} 상태: ${status}, 판매중인가: ${isActive}`);
            return isActive;
          });
          break;
        case 'sold':
          filtered = this.myProducts.filter(item => {
            const status = item.product.status;
            // 판매완료 상태 체크 (한글/영문 모두 고려)
            const isSold = ['SOLD_OUT', '판매완료', '품절', 'sold_out', 'sold'].includes(status) ||
                          (status && (status.toLowerCase().includes('sold') || status.toLowerCase().includes('out')));
            console.log(`상품 ${item.product.id} 상태: ${status}, 판매완료인가: ${isSold}`);
            return isSold;
          });
          break;
        case 'inactive':
          filtered = this.myProducts.filter(item => {
            const status = item.product.status;
            // 판매중지 상태 체크 (한글/영문 모두 고려)
            const isInactive = ['INACTIVE', 'DISCONTINUED', '판매중지', '판매 중단', 'inactive', 'discontinued'].includes(status) ||
                              (status && (status.toLowerCase().includes('inactive') || status.toLowerCase().includes('discontinued')));
            console.log(`상품 ${item.product.id} 상태: ${status}, 판매중지인가: ${isInactive}`);
            return isInactive;
          });
          break;
        default: // 'all' 경우
          filtered = this.myProducts;
          break;
      }
      
      console.log(`필터 결과: ${filtered.length}개 상품`);
      return filtered;
    },
    
    getEmptyMessage() {
      switch (this.activeFilter) {
        case 'active':
          return '판매중인 상품이 없습니다'
        case 'sold':
          return '판매완료된 상품이 없습니다'
        case 'inactive':
          return '판매중지된 상품이 없습니다'
        default:
          return '등록한 상품이 없습니다'
      }
    },
    
    getEmptyDescription() {
      switch (this.activeFilter) {
        case 'active':
          return '현재 판매중인 상품이 없습니다. 새로운 상품을 등록해보세요.'
        case 'sold':
          return '아직 판매완료된 상품이 없습니다.'
        case 'inactive':
          return '판매를 중지한 상품이 없습니다.'
        default:
          return '아직 등록한 상품이 없습니다. 첫 상품을 등록해보세요!'
      }
    },
    
    goToProduct(productId) {
      if (!productId) {
        console.error('유효하지 않은 상품 ID:', productId)
        return
      }
      
      this.$router.push({ name: 'ProductDetail', params: { id: String(productId) } })
    },
    
    editProduct(productId) {
      if (!productId) {
        console.error('유효하지 않은 상품 ID:', productId)
        return
      }
      
      this.$router.push({ name: 'EditProduct', params: { id: String(productId) } })
    },
    
    async deleteProductItem(productId) {
      this.hideContextMenu();
      
      if (!productId) {
        console.error('유효하지 않은 상품 ID:', productId)
        return
      }
      
      // 삭제 확인
      const product = this.myProducts.find(item => item.product.id === productId)?.product;
      if (!product) {
        console.error('상품을 찾을 수 없습니다:', productId);
        return;
      }
      
      if (!confirm(`'${product.name}' 상품을 정말로 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
        return;
      }
      
      try {
        await this.deleteProduct(productId)
        
        // 성공 메시지 표시
        if (this.$toast) {
          this.$toast.success('상품이 성공적으로 삭제되었습니다.')
        } else {
          alert('상품이 성공적으로 삭제되었습니다.')
        }
        
        // 상품 목록 새로고침
        await this.fetchMyProducts()
      } catch (error) {
        console.error('상품 삭제 오류:', error)
        if (this.$toast) {
          this.$toast.error(error.message || '상품 삭제 중 오류가 발생했습니다.')
        } else {
          alert(error.message || '상품 삭제 중 오류가 발생했습니다.')
        }
      }
    },
    
    // 위시리스트 토글 이벤트 핸들러
    handleWishlistToggle(productId) {
      console.log('MyProducts 페이지에서 위시리스트 토글 이벤트 수신:', productId);
      
      // 해당 상품 찾기
      const productIndex = this.myProducts.findIndex(item => item.product.id === productId);
      
      if (productIndex !== -1) {
        // Vuex 스토어에서 최신 상태 가져오기
        const storeProduct = this.$store.state.products.product;
        
        if (storeProduct && storeProduct.product && storeProduct.product.id === productId) {
          // 스토어에서 최신 상태로 업데이트
          this.myProducts[productIndex].stats.isWishlisted = storeProduct.stats.isWishlisted;
          this.myProducts[productIndex].stats.wishlistCount = storeProduct.stats.wishlistCount;
          
          console.log(`상품 ${productId}의 위시리스트 상태 업데이트:`, {
            isWishlisted: storeProduct.stats.isWishlisted,
            wishlistCount: storeProduct.stats.wishlistCount
          });
        } else {
          // 스토어에 없는 경우 현재 상태 토글
          this.myProducts[productIndex].stats.isWishlisted = !this.myProducts[productIndex].stats.isWishlisted;
          
          // 위시리스트 수량 조정
          if (this.myProducts[productIndex].stats.isWishlisted) {
            this.myProducts[productIndex].stats.wishlistCount += 1;
          } else {
            this.myProducts[productIndex].stats.wishlistCount = Math.max(0, this.myProducts[productIndex].stats.wishlistCount - 1);
          }
          
          console.log(`상품 ${productId}의 위시리스트 상태 로컬 토글:`, {
            isWishlisted: this.myProducts[productIndex].stats.isWishlisted,
            wishlistCount: this.myProducts[productIndex].stats.wishlistCount
          });
        }
        
        // Vue의 반응성을 위해 배열 요소 강제 업데이트
        this.$set(this.myProducts, productIndex, { ...this.myProducts[productIndex] });
      } else {
        console.warn(`상품 ID ${productId}를 myProducts 배열에서 찾을 수 없습니다.`);
      }
    },
    
    // 컨텍스트 메뉴 관련 메서드
    showContextMenu(event, product) {
      this.contextMenu = {
        show: true,
        x: event.clientX,
        y: event.clientY,
        product: product
      };
    },
    
    hideContextMenu() {
      this.contextMenu.show = false;
      this.contextMenu.product = null;
    },
    
    isActive(product) {
      return product.status === 'ACTIVE' || product.status === '판매중' || !product.status;
    },
    
    isSoldOut(product) {
      return product.status === 'SOLD_OUT' || product.status === '판매완료' || product.status === '품절';
    },
    
    // 판매 완료 처리 메서드
    async markAsSold(product) {
      this.hideContextMenu();
      
      try {
        // 구매자 ID 입력 받기
        const buyerId = prompt('구매자 ID를 입력해주세요:', '');
        
        if (!buyerId) {
          return; // 취소 버튼 누르거나 입력하지 않은 경우
        }
        
        if (isNaN(buyerId)) {
          alert('구매자 ID는 숫자만 입력해주세요.');
          return;
        }
        
        // 토큰 가져오기
        const token = this.$store.state.auth.token;
        if (!token) {
          alert('인증 토큰이 없습니다. 다시 로그인해주세요.');
          return;
        }
        
        // API 호출
        const response = await fetch(`/api/products/${product.id}/sold?buyerId=${buyerId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`판매 완료 처리에 실패했습니다. (${response.status})`);
        }
        
        const result = await response.json();
        
        // 토스트 메시지 표시
        if (this.$toast) {
          this.$toast.success('상품이 판매 완료 처리되었습니다.');
        } else {
          alert('상품이 판매 완료 처리되었습니다.');
        }
        
        // 목록 새로고침
        await this.fetchMyProducts();
      } catch (error) {
        console.error('판매 완료 처리 오류:', error);
        if (this.$toast) {
          this.$toast.error(`판매 완료 처리 중 오류가 발생했습니다: ${error.message}`);
        } else {
          alert(`판매 완료 처리 중 오류가 발생했습니다: ${error.message}`);
        }
      }
    },
    
    // 판매 완료 취소 메서드
    async cancelSold(product) {
      this.hideContextMenu();
      
      try {
        if (!confirm(`'${product.name}' 상품의 판매 완료를 취소하시겠습니까?`)) {
          return;
        }
        
        // 토큰 가져오기
        const token = this.$store.state.auth.token;
        if (!token) {
          alert('인증 토큰이 없습니다. 다시 로그인해주세요.');
          return;
        }
        
        // API 호출
        const response = await fetch(`/api/products/${product.id}/cancel-sold`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`판매 완료 취소에 실패했습니다. (${response.status})`);
        }
        
        const result = await response.json();
        
        // 토스트 메시지 표시
        if (this.$toast) {
          this.$toast.success('판매 완료가 취소되었습니다.');
        } else {
          alert('판매 완료가 취소되었습니다.');
        }
        
        // 목록 새로고침
        await this.fetchMyProducts();
      } catch (error) {
        console.error('판매 완료 취소 오류:', error);
        if (this.$toast) {
          this.$toast.error(`판매 완료 취소 중 오류가 발생했습니다: ${error.message}`);
        } else {
          alert(`판매 완료 취소 중 오류가 발생했습니다: ${error.message}`);
        }
      }
    }
  }
}
</script>

<style scoped>
.aspect-square {
  aspect-ratio: 1 / 1;
}
</style>
