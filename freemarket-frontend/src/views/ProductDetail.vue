<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <main class="py-6">
      <div class="container mx-auto px-4">
        <!-- 네비게이션 브레드크럼 -->
        <nav class="mb-6 flex items-center text-sm text-gray-600">
          <router-link to="/" class="text-blue-600 hover:text-blue-800">홈</router-link>
          <i class="fas fa-chevron-right mx-2 text-gray-400 text-xs"></i>
          <router-link to="/products" class="text-blue-600 hover:text-blue-800">상품</router-link>
          <i v-if="product" class="fas fa-chevron-right mx-2 text-gray-400 text-xs"></i>
          <span v-if="product" class="text-gray-500 truncate max-w-xs">{{ product.product.name }}</span>
        </nav>
        
        <!-- 로딩 상태 -->
        <div v-if="loading" class="bg-white rounded-lg shadow-sm p-6">
          <div class="animate-pulse">
            <div class="flex flex-col md:flex-row">
              <div class="md:w-1/2 h-80 bg-gray-200 rounded-lg"></div>
              <div class="md:w-1/2 md:pl-8 mt-6 md:mt-0">
                <div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div class="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                <div class="h-12 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 상품 없음 상태 -->
        <div v-else-if="!product" class="bg-white rounded-lg shadow-sm p-8 text-center">
          <p class="text-gray-500 mb-4">상품을 찾을 수 없습니다.</p>
          <router-link 
            to="/products" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            상품 목록으로 돌아가기
          </router-link>
        </div>
        
        <!-- 상품 상세 정보 -->
        <div v-else class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- 상품 이미지 -->
              <div>
                <ProductGallery :images="productImages" />
              </div>
              
              <!-- 상품 정보 -->
              <div>
                <div class="flex justify-between items-start">
                  <h1 class="text-2xl font-bold text-gray-900">{{ product.product.name }}</h1>
                  <span v-if="product.product.status === 'SOLD_OUT'" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <i class="fas fa-tag mr-1"></i>
                    판매 완료
                  </span>
                </div>
                
                <p class="text-3xl font-bold text-gray-900 mt-3">{{ formatPrice(product.product.price) }}<span class="text-lg">원</span></p>
                
                <div class="flex items-center mt-4 space-x-6 text-gray-500 text-sm">
                  <div class="flex items-center">
                    <i class="far fa-eye mr-1"></i>
                    <span>{{ product.stats.viewCount }} 조회</span>
                  </div>
                  <div class="flex items-center">
                    <i class="far fa-heart mr-1"></i>
                    <span>{{ product.stats.wishlistCount }} 관심</span>
                  </div>
                </div>
                
                <div class="mt-6 border-t border-b border-gray-100 py-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <h3 class="text-sm text-gray-500 mb-1">카테고리</h3>
                      <p class="text-gray-900">{{ product.product.category || '-' }}</p>
                    </div>
                    <div>
                      <h3 class="text-sm text-gray-500 mb-1">상태</h3>
                      <p class="text-gray-900">{{ product.product.status === 'ACTIVE' ? '판매중' : '판매 완료' }}</p>
                    </div>
                    <div>
                      <h3 class="text-sm text-gray-500 mb-1">판매자</h3>
                      <p class="text-gray-900">{{ product.product.sellerName }}</p>
                    </div>
                    <div>
                      <h3 class="text-sm text-gray-500 mb-1">재고</h3>
                      <p class="text-gray-900">{{ product.product.stock }}개</p>
                    </div>
                    <div class="col-span-2">
                      <h3 class="text-sm text-gray-500 mb-1">상품 등록일</h3>
                      <p class="text-gray-900">{{ formatDate(product.product.createdDate) }}</p>
                    </div>
                    <div class="col-span-2">
                      <h3 class="text-sm text-gray-500 mb-1">마지막 수정일</h3>
                      <p class="text-gray-900">{{ formatDate(product.product.updatedDate) }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="mt-6 space-y-3">
                  <button 
                    @click="toggleWishlistItem"
                    class="w-full px-4 py-3 border rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                    :class="product.stats.isWishlisted ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                    :disabled="product.product.status === 'SOLD_OUT'"
                  >
                    <i :class="product.stats.isWishlisted ? 'fas fa-heart' : 'far fa-heart'"></i>
                    <span>{{ product.stats.isWishlisted ? '관심 상품에서 제거' : '관심 상품에 추가' }}</span>
                  </button>
                  
                  <button 
                    class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    @click="buyProduct"
                    :disabled="product.product.stock <= 0 || product.product.status === 'SOLD_OUT'"
                    :class="{'opacity-50 cursor-not-allowed': product.product.stock <= 0 || product.product.status === 'SOLD_OUT'}"
                  >
                    <i class="fas fa-shopping-cart"></i>
                    <span>{{ product.product.stock <= 0 || product.product.status === 'SOLD_OUT' ? '구매 불가' : '구매하기' }}</span>
                  </button>
                  
                  <button 
                    class="w-full px-4 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                    @click="contactSeller"
                  >
                    <i class="fas fa-comment-dots"></i>
                    <span>판매자에게 문의하기</span>
                  </button>
                  
                  <!-- 판매자 전용 버튼 그룹 -->
                  <div v-if="isProductOwner" class="grid grid-cols-2 gap-3 pt-2">
                    <router-link 
                      :to="{ name: 'EditProduct', params: { id: product.product.id } }"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <i class="fas fa-edit"></i>
                      <span>상품 수정</span>
                    </router-link>
                    
                    <button 
                      class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                      @click="confirmDeleteProduct"
                    >
                      <i class="fas fa-trash-alt"></i>
                      <span>상품 삭제</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 상품 설명 -->
            <div class="p-6 border-t border-gray-100">
              <h2 class="text-xl font-bold text-gray-900 mb-4">상품 정보</h2>
              <div class="prose max-w-none">
                <p class="whitespace-pre-line text-gray-700">{{ product.product.description || '등록된 상품 설명이 없습니다.' }}</p>
              </div>
            </div>
          </div>
          
          <!-- 판매자 정보 -->
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">판매자 정보</h2>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-gray-400 text-xl"></i>
                  </div>
                  <div class="ml-4">
                    <h3 class="font-medium text-gray-900">{{ product.product.sellerName }}</h3>
                    <p class="text-sm text-gray-500">판매자</p>
                  </div>
                </div>
                <button 
                  @click="viewSellerProfile"
                  class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                >
                  <i class="fas fa-user-circle mr-2"></i>
                  판매자 프로필 보기
                </button>
              </div>
              
              <!-- 판매자 상세 정보 -->
              <div v-if="sellerProfile" class="mt-6 pt-6 border-t border-gray-100">
                <h4 class="font-medium text-gray-900 mb-4">판매자 상세 정보</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500 mb-1">이름</p>
                    <p class="text-gray-900">{{ sellerProfile.name || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-1">연락처</p>
                    <p class="text-gray-900">{{ sellerProfile.phone || '미등록' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-1">이메일</p>
                    <p class="text-gray-900">{{ sellerProfile.email || '미등록' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-1">회원 등급</p>
                    <p class="text-gray-900">{{ sellerProfile.grade || '일반' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 리뷰 섹션 -->
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6">상품 리뷰</h2>
              <ReviewList 
                v-if="product && product.product" 
                :productId="String(product.product.id)" 
              />
              <div v-else class="text-center py-8 text-gray-500">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                리뷰를 불러오는 중입니다...
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import ProductGallery from '@/components/products/ProductGallery.vue'
import ReviewList from '@/components/reviews/ReviewList.vue'
import { mapState, mapActions } from 'vuex'
import chatService from '@/services/chatService'

export default {
  components: {
    AppHeader,
    ProductGallery,
    ReviewList
  },

  computed: {
    ...mapState('products', ['product', 'loading']),
    ...mapState('auth', ['user']),
    
    productImages() {
      if (!this.product) return []
      
      return this.product.product.imageUrls.map(url => ({
        url,
        thumbnail: url
      }))
    },
    
    isAuthenticated() {
      return this.$store.state.auth.isAuthenticated
    },
    
    token() {
      return this.$store.state.auth.token
    },
    
    currentUser() {
      return this.$store.state.auth.user
    },
    
    isProductOwner() {
      return this.isAuthenticated && 
             this.user && 
             this.product && 
             this.product.product &&
             (this.product.product.sellerId === this.user.id || 
              this.product.product.sellerName === this.user.name ||
              this.product.product.sellerName === this.user.username)
    }
  },
  
  created() {
    console.log('ProductDetail created - 상품 ID:', this.$route.params.id);
    this.loadProductData();
  },
  
  data() {
    return {
      sellerProfile: null
    }
  },
  
  methods: {
    async loadProductData() {
      try {
        const productId = this.$route.params.id;
        console.log('상품 데이터 로드 시작:', productId);
        
        if (!productId) {
          console.error('상품 ID가 없습니다');
          return;
        }
        
        this.$store.dispatch('products/setSkipViewIncrement', false);
        
        // 상품 데이터를 가져오기 전에 위시리스트 상태를 먼저 확인
        // 로그인한 경우에만 위시리스트 데이터 로드
        if (this.isAuthenticated) {
          await this.$store.dispatch('products/fetchWishlist');
        }
        
        await this.fetchProduct(productId);
        console.log('상품 데이터 로드 완료:', this.product);
      } catch (error) {
        console.error('상품 데이터 로드 오류:', error);
      }
    },
    
    ...mapActions('products', ['fetchProduct', 'deleteProduct']),
    
    formatPrice(price) {
      return new Intl.NumberFormat('ko-KR').format(price)
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    
    async buyProduct() {
      if (!this.isAuthenticated) {
        return this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
      }
      
      try {
        if (this.isProductOwner) {
          alert('자신의 상품은 구매할 수 없습니다.');
          return;
        }
        
        const confirmMessage = '현재 시스템에서는 판매자가 구매 완료 처리를 진행해야 합니다.\n\n판매자에게 문의하시겠습니까?';
        
        if (confirm(confirmMessage)) {
          this.contactSeller();
          
          if (this.$toast) {
            this.$toast.success('판매자에게 문의 요청이 전송되었습니다. 판매자의 응답을 기다려주세요.');
          } else {
            alert('판매자에게 문의 요청이 전송되었습니다. 판매자의 응답을 기다려주세요.');
          }
        }
      } catch (error) {
        console.error('상품 구매 오류:', error)
        if (this.$toast) {
          this.$toast.error(error.message || '상품 구매 중 오류가 발생했습니다.')
        } else {
          alert(error.message || '상품 구매 중 오류가 발생했습니다.')
        }
      }
    },
    
    async toggleWishlistItem() {
      if (!this.isAuthenticated) {
        return this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
      }
      
      try {
        const productId = this.product.product.id
        
        const wasWishlisted = this.product.stats.isWishlisted
        
        // Vuex action을 통해 API 호출
        const result = await this.$store.dispatch('products/toggleWishlist', productId)
        
        // API 응답에 따라 상품 상태 직접 업데이트 (추가적인 보장)
        if (this.product && this.product.stats) {
          this.product.stats.isWishlisted = result.isWishlisted;
          this.product.stats.wishlistCount = result.count;
        }
        
        if (this.$toast) {
          this.$toast.success(wasWishlisted ? '관심 상품에서 제거되었습니다.' : '관심 상품에 추가되었습니다.')
        }
      } catch (error) {
        console.error('관심 상품 처리 오류:', error)
        if (this.$toast) {
          this.$toast.error('관심 상품 처리 중 오류가 발생했습니다.')
        } else {
          alert('관심 상품 처리 중 오류가 발생했습니다.')
        }
      }
    },
    
    async viewSellerProfile() {
      try {
        if (!this.product || !this.product.product || !this.product.product.sellerId) {
          if (this.$toast) {
            this.$toast.error('판매자 정보를 불러올 수 없습니다.')
          } else {
            alert('판매자 정보를 불러올 수 없습니다.')
          }
          return
        }
        
        const sellerId = this.product.product.sellerId
        
        if (this.sellerProfile) {
          this.sellerProfile = null
          return
        }
        
        const token = this.$store.state.auth.token
        if (!token) {
          if (this.$toast) {
            this.$toast.error('로그인이 필요한 서비스입니다.')
          } else {
            alert('로그인이 필요한 서비스입니다.')
          }
          return
        }
        
        const response = await fetch(`/api/users/profile/${sellerId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`판매자 프로필 조회에 실패했습니다. (${response.status})`)
        }
        
        const result = await response.json()
        console.log('판매자 프로필 응답:', result)
        
        if (result && result.data) {
          this.sellerProfile = result.data
          if (this.$toast) {
            this.$toast.success('판매자 프로필을 조회했습니다.')
          }
        } else {
          throw new Error('판매자 프로필 정보가 없습니다.')
        }
      } catch (error) {
        console.error('판매자 프로필 조회 오류:', error)
        if (this.$toast) {
          this.$toast.error(`판매자 프로필 조회 중 오류가 발생했습니다: ${error.message}`)
        } else {
          alert(`판매자 프로필 조회 중 오류가 발생했습니다: ${error.message}`)
        }
      }
    },
    
    async contactSeller() {
      // 로그인 확인
      if (!this.isAuthenticated) {
        alert('로그인이 필요한 서비스입니다.')
        return this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
      }
      
      // 자신의 상품인지 확인
      if (this.isProductOwner) {
        alert('자신의 상품에는 문의할 수 없습니다.')
        return
      }
      
      // 상품 상태 확인
      if (!this.product || !this.product.product) {
        alert('상품 정보를 불러올 수 없습니다.')
        return
      }
      
      try {
        console.log('🚀 채팅방 생성 시작...')
        
        // 로딩 표시
        const loadingToast = this.$toast ? 
          this.$toast.info('채팅방을 생성하고 있습니다...', { duration: 0 }) : 
          null
        
        // 채팅방 생성 또는 기존 채팅방 조회
        const response = await chatService.createChatRoom(this.product.product.id)
        
        if (loadingToast && this.$toast) {
          this.$toast.dismiss(loadingToast)
        }
        
        console.log('✅ 채팅방 생성/조회 성공:', response)
        
        if (response && response.data) {
          const chatRoom = response.data
          
          // 성공 메시지
          if (this.$toast) {
            this.$toast.success('채팅방으로 이동합니다.')
          }
          
          // 채팅방으로 이동
          console.log('🏃‍♂️ 채팅방으로 이동:', chatRoom.chatRoomId)
          this.$router.push({
            name: 'ChatRoom',
            params: { roomId: chatRoom.chatRoomId }
          })
        } else {
          throw new Error('채팅방 정보를 받지 못했습니다.')
        }
        
      } catch (error) {
        console.error('❌ 채팅방 생성 실패:', error)
        
        if (this.$toast) {
          this.$toast.dismiss() // 모든 토스트 제거
        }
        
        let errorMessage = '채팅방 생성 중 오류가 발생했습니다.'
        
        if (error.response) {
          switch (error.response.status) {
            case 403:
              errorMessage = '채팅방 생성 권한이 없습니다.'
              break
            case 404:
              errorMessage = '상품을 찾을 수 없습니다.'
              break
            case 409:
              errorMessage = '이미 채팅방이 존재합니다. 다시 시도해주세요.'
              break
            case 500:
              errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
              break
            default:
              errorMessage = error.response.data?.message || errorMessage
          }
        } else if (error.message) {
          errorMessage = error.message
        }
        
        if (this.$toast) {
          this.$toast.error(errorMessage)
        } else {
          alert(errorMessage)
        }
      }
    },
    
    confirmDeleteProduct() {
      if (confirm('정말로 이 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        this.deleteProductItem()
      }
    },
    
    async deleteProductItem() {
      try {
        await this.deleteProduct(this.product.product.id)
        
        if (this.$toast) {
          this.$toast.success('상품이 성공적으로 삭제되었습니다.')
        } else {
          alert('상품이 성공적으로 삭제되었습니다.')
        }
        
        this.$router.push({ name: 'ProductList' })
      } catch (error) {
        console.error('상품 삭제 오류:', error)
        if (this.$toast) {
          this.$toast.error(error.message || '상품 삭제 중 오류가 발생했습니다.')
        } else {
          alert(error.message || '상품 삭제 중 오류가 발생했습니다.')
        }
      }
    }
  }
}
</script>

<style scoped>
@media (max-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .md\:pl-8 {
    padding-left: 0;
  }
  
  .md\:mt-0 {
    margin-top: 1.5rem;
  }
}
</style>
