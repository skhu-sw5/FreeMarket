<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <main class="py-6">
      <div class="container mx-auto px-4">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">내 프로필</h1>
        
        <!-- 로딩 상태 -->
        <div v-if="loading" class="bg-white rounded-lg shadow-sm p-6">
          <div class="animate-pulse">
            <div class="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div class="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div class="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        
        <!-- 에러 상태 -->
        <div v-else-if="!user" class="bg-white rounded-lg shadow-sm p-6 text-center">
          <p class="text-red-500 mb-4">사용자 정보를 불러올 수 없습니다.</p>
          <div class="flex space-x-4 justify-center">
            <button 
              @click="reloadPage" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              새로고침
            </button>
            <button 
              @click="logout" 
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
        
        <div v-else class="space-y-6">
          <!-- 프로필 정보 카드 -->
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="p-6">
              <div class="flex flex-col md:flex-row">
                <!-- 프로필 이미지 -->
                <div class="md:w-64 flex flex-col items-center md:border-r md:pr-6">
                  <div class="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i class="fas fa-user text-gray-400 text-4xl"></i>
                  </div>
                  <h2 class="text-xl font-bold text-gray-900">{{ user?.name }}</h2>
                </div>
                
                <!-- 프로필 정보 -->
                <div class="md:flex-1 md:pl-6 mt-6 md:mt-0">
                  <div class="space-y-4">
                    <div>
                      <h3 class="text-sm font-medium text-gray-500">이메일</h3>
                      <p class="text-gray-900">{{ user?.email }}</p>
                    </div>
                    <div>
                      <h3 class="text-sm font-medium text-gray-500">연락처</h3>
                      <p class="text-gray-900">{{ user?.phone || '미등록' }}</p>
                    </div>
                    <div>
                      <h3 class="text-sm font-medium text-gray-500">학교 이메일 인증</h3>
                      <div class="flex items-center">
                        <span v-if="isEmailVerified" class="text-green-600 font-medium flex items-center">
                          <i class="fas fa-check-circle mr-1"></i>
                          인증 완료
                        </span>
                        <span v-else class="text-red-600 font-medium flex items-center">
                          <i class="fas fa-exclamation-circle mr-1"></i>
                          인증 필요
                        </span>
                        <button 
                          v-if="!isEmailVerified" 
                          @click="goToEmailVerification" 
                          class="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          인증하기
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 프로필 액션 버튼 -->
                  <div class="mt-6 flex space-x-3">
                    <button 
                      v-if="!isEditMode"
                      @click="isEditMode = true" 
                      class="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <i class="fas fa-edit"></i>
                      <span>프로필 수정</span>
                    </button>
                    <router-link 
                      to="/profile/change-password" 
                      class="w-full px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                      v-if="!isEditMode"
                    >
                      <i class="fas fa-key"></i>
                      <span>비밀번호 변경</span>
                    </router-link>
                  </div>
                </div>
              </div>
              
              <!-- 프로필 수정 폼 -->
              <form v-if="isEditMode" class="mt-6 pt-6 border-t" @submit.prevent="updateProfile">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1" for="name">이름</label>
                    <input 
                      type="text" 
                      id="name" 
                      v-model="form.name" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1" for="phone">연락처</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      v-model="form.phone" 
                      placeholder="010-1234-5678"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div class="flex space-x-3 pt-2">
                    <button 
                      type="submit" 
                      class="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <i class="fas fa-save"></i>
                      <span>저장</span>
                    </button>
                    <button 
                      type="button" 
                      @click="cancelEdit"
                      class="w-full px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          <!-- 내 판매 상품 -->
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="p-6">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-900">내 판매 상품</h2>
                <router-link 
                  to="/user/products" 
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  전체 관리 <i class="fas fa-arrow-right ml-1 text-xs"></i>
                </router-link>
              </div>
              
              <div v-if="myProducts.length === 0" class="text-center py-8">
                <p class="text-gray-500 mb-4">등록한 상품이 없습니다.</p>
                <router-link 
                  to="/sell" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <i class="fas fa-plus mr-2"></i>
                  상품 등록하기
                </router-link>
              </div>
              
              <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ProductCard 
                  v-for="product in myProducts" 
                  :key="product.product.id || 'unknown'"
                  :product="product.product"
                  :stats="product.stats"
                  @click="goToProduct(product.product.id)"
                  @wishlist-toggle="handleWishlistToggle"
                />
              </div>
            </div>
          </div>
          
          <!-- 내가 작성한 리뷰 -->
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="p-6">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-900">내가 작성한 리뷰</h2>
                <router-link 
                  to="/user/reviews" 
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  모두 보기 <i class="fas fa-arrow-right ml-1 text-xs"></i>
                </router-link>
              </div>
              
              <div class="text-center py-8">
                <p class="text-gray-500 mb-4">
                  내가 작성한 리뷰를 관리하고 수정할 수 있습니다.
                </p>
                <router-link 
                  to="/user/reviews" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <i class="fas fa-comment-alt mr-2"></i>
                  리뷰 관리하기
                </router-link>
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
import ProductCard from '@/components/products/ProductCard.vue'
import { mapState, mapActions } from 'vuex'
import { apiGet } from '@/utils/api'

export default {
  name: 'ProfileView',
  
  components: {
    AppHeader,
    ProductCard
  },
  
  data() {
    return {
      loading: true,
      isEditMode: false,
      form: {
        name: '',
        phone: ''
      },
      myProducts: []
    }
  },
  
  computed: {
    ...mapState('auth', ['user']),
    
    // 이메일 인증 상태를 확실하게 계산
    isEmailVerified() {
      // 디버깅을 위한 로깅 추가 (실제 값과 타입 확인)
      console.log("이메일 인증 상태 원본 값:", this.user?.emailVerified);
      
      // API 응답의 emailVerified 값으로 반환
      return this.user?.emailVerified === true;
    }
  },
  
  // Vuex 스토어 상태 변화 감지
  watch: {
    // 스토어의 상품 상태 변화를 감지하여 프로필 페이지의 상품 목록 업데이트
    '$store.state.products.product': {
      handler(newProduct) {
        if (newProduct && newProduct.product && this.myProducts.length > 0) {
          const productId = newProduct.product.id;
          const productIndex = this.myProducts.findIndex(item => item.product.id === productId);
          
          if (productIndex !== -1) {
            // 위시리스트 상태만 업데이트 (다른 정보는 유지)
            this.myProducts[productIndex].stats.isWishlisted = newProduct.stats.isWishlisted;
            this.myProducts[productIndex].stats.wishlistCount = newProduct.stats.wishlistCount;
            this.myProducts[productIndex].stats.viewCount = newProduct.stats.viewCount;
            
            console.log(`프로필 페이지 상품 ${productId} 상태 자동 업데이트:`, {
              isWishlisted: newProduct.stats.isWishlisted,
              wishlistCount: newProduct.stats.wishlistCount,
              viewCount: newProduct.stats.viewCount
            });
            
            // Vue의 반응성을 위해 배열 요소 강제 업데이트
            this.$set(this.myProducts, productIndex, { ...this.myProducts[productIndex] });
          }
        }
      },
      deep: true
    }
  },
  
  // 라우터 가드 설정
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // 이메일 인증 페이지에서 돌아온 경우 사용자 정보 새로고침
      if (from.path === '/email-verification') {
        console.log('이메일 인증 페이지에서 돌아왔습니다. 사용자 정보를 새로고침합니다.');
        vm.refreshUserInfo();
      }
    });
  },
  
  async created() {
    try {
      // 프로필 페이지에서 조회수 증가를 건너뛰도록 설정
      this.$store.dispatch('products/setSkipViewIncrement', true);
      
      if (!this.user) {
        console.log('사용자 정보 가져오기 시도...');
        const userData = await this.fetchUser();
        
        if (!userData) {
          console.log('사용자 정보를 가져오지 못했습니다.');
          // 사용자 로딩 실패시 추가 처리
          if (!this.$store.state.auth.token) {
            console.log('토큰이 없거나 만료되었습니다. 로그인 페이지로 이동합니다.');
            this.$router.push('/login');
            return;
          }
        } else {
          console.log('사용자 정보를 성공적으로 가져왔습니다.');
          console.log('이메일 인증 상태:', userData.emailVerified);
          
          // 명시적으로 이메일 인증 상태를 boolean으로 설정
          if (userData.emailVerified !== undefined) {
            this.$store.commit('auth/UPDATE_USER', {
              emailVerified: Boolean(userData.emailVerified)
            });
          }
        }
      } else {
        console.log('이미 사용자 정보가 있습니다. 이메일 인증 상태:', this.user.emailVerified);
      }
      
      if (this.user) {
        this.initForm();
        await this.fetchMyProducts();
      } else {
        console.log('사용자 정보가 없습니다. 폼 초기화 및 상품 로딩을 건너뜁니다.');
      }
    } catch (error) {
      console.error('프로필 초기화 오류:', error);
      // 인증 관련 오류인 경우
      if (error.message && (
          error.message.includes('인증') || 
          error.message.includes('로그인') || 
          error.message.includes('토큰')
      )) {
        alert('로그인이 필요합니다.');
        this.$router.push('/login');
      }
    } finally {
      this.loading = false;
      
      // 원래 상태로 복원
      this.$store.dispatch('products/setSkipViewIncrement', false);
    }
  },
  
  methods: {
    ...mapActions('auth', ['fetchUser', 'updateUser', 'logout']),
    
    initForm() {
      if (this.user) {
        this.form = {
          name: this.user.name || '',
          phone: this.user.phone || ''
        }
      } else {
        this.form = {
          name: '',
          phone: ''
        }
      }
    },
    
    async fetchMyProducts() {
      const token = this.$store.state.auth.token;
      
      if (!token) {
        console.error('토큰이 없어 내 상품 목록을 불러올 수 없습니다.');
        return;
      }
      
      try {
        console.log('내 판매 상품 목록 가져오기 요청 시작...');
        
        try {
          // api.js의 apiGet 함수 사용 (토큰 갱신 자동 처리)
          const data = await apiGet('/api/users/profile/selling', {
            // 500 에러를 무시하도록 설정
            handleError: (status) => status === 500 ? false : true
          });
          
          console.log('내 판매 상품 목록 응답 데이터:', data);
          
          // 응답 데이터 구조 확인
          if (data && data.data) {
            if (Array.isArray(data.data)) {
              // 배열 형태 응답인 경우
              this.myProducts = data.data;
            } else if (data.data.content && Array.isArray(data.data.content)) {
              // 페이징 처리된, content 필드가 있는 응답인 경우
              this.myProducts = data.data.content;
            } else if (data.data.activeProducts || data.data.soldProducts) {
              // 판매 내역 응답 구조 (활성 상품 및 판매된 상품 분리)
              console.log('판매 내역 데이터 구조 감지됨:', data.data);
              
              const activeProducts = (data.data.activeProducts || []).map(product => {
                // API 응답에서 상품 정보와 통계 정보를 직접 추출
                return {
                  product: {
                    id: product.id || product.productId,
                    name: product.name,
                    price: product.price,
                    stock: product.stock || 0,
                    category: product.category,
                    status: product.status || 'ACTIVE',
                    description: product.description || '',
                    thumbnailUrl: product.thumbnailUrl,
                    sellerName: product.sellerName || this.user?.name,
                    createdDate: product.createdDate,
                    soldDate: product.soldDate,
                    buyerName: product.buyerName
                  },
                  stats: { 
                    // API가 이미 이 정보를 제공한다면 그대로 사용, 아니면 기본값 설정
                    viewCount: product.viewCount || product.stats?.viewCount || 0,
                    wishlistCount: product.wishlistCount || product.stats?.wishlistCount || 0,
                    isWishlisted: product.isWishlisted || product.stats?.isWishlisted || false
                  }
                };
              });
              
              const soldProducts = (data.data.soldProducts || []).map(product => {
                return {
                  product: {
                    id: product.id || product.productId,
                    name: product.name,
                    price: product.price,
                    stock: product.stock || 0,
                    category: product.category,
                    status: product.status || 'SOLD_OUT',
                    description: product.description || '',
                    thumbnailUrl: product.thumbnailUrl,
                    sellerName: product.sellerName || this.user?.name,
                    createdDate: product.createdDate,
                    soldDate: product.soldDate,
                    buyerName: product.buyerName
                  },
                  stats: { 
                    // API가 이미 이 정보를 제공한다면 그대로 사용, 아니면 기본값 설정
                    viewCount: product.viewCount || product.stats?.viewCount || 0,
                    wishlistCount: product.wishlistCount || product.stats?.wishlistCount || 0,
                    isWishlisted: product.isWishlisted || product.stats?.isWishlisted || false
                  }
                };
              });
              
              this.myProducts = [...activeProducts, ...soldProducts];
              console.log('변환된 상품 목록 (개별 조회 없음):', this.myProducts);
            } else {
              // 다른 구조인 경우, 로그만 남기고 빈 배열 사용
              console.warn('예상치 못한 응답 구조:', data);
              this.myProducts = [];
            }
          } else {
            this.myProducts = [];
          }
        } catch (error) {
          // API 호출 실패 처리
          console.error('API 호출 오류:', error);
          
          // 오류 발생 시 빈 상품 목록으로 처리
          console.log('판매 상품이 없거나 서버 오류가 발생했습니다. 빈 목록으로 처리합니다.');
          this.myProducts = [];
        }
      } catch (error) {
        console.error('내 판매 상품 목록 조회 오류:', error);
        
        // 데이터가 없는 것으로 처리
        this.myProducts = [];
      }
    },
    

    
    goToEmailVerification() {
      this.$router.push('/email-verification');
    },
    
    // 사용자 정보를 새로고침하는 메서드
    async refreshUserInfo() {
      this.loading = true;
      try {
        await this.fetchUser();
        console.log('사용자 정보가 새로고침되었습니다.');
      } catch (error) {
        console.error('사용자 정보 새로고침 실패:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async updateProfile() {
      try {
        await this.updateUser(this.form)
        this.isEditMode = false
        
        // 성공 메시지 표시
        alert('프로필이 업데이트되었습니다.')
      } catch (error) {
        console.error('프로필 업데이트 오류:', error)
        alert('프로필 업데이트에 실패했습니다.')
      }
    },
    
    cancelEdit() {
      this.initForm()
      this.isEditMode = false
    },
    
    goToProduct(id) {
      // ID 확인 로깅
      console.log('상품 페이지로 이동 시도:', id);
      
      // ID가 유효한지 확인
      if (!id) {
        console.error('유효하지 않은 상품 ID:', id);
        return; // 유효하지 않은 ID면 이동하지 않음
      }
      
      try {
        this.$router.push({ name: 'ProductDetail', params: { id: String(id) } });
      } catch (error) {
        console.error('상품 페이지 이동 오류:', error);
        // 일반 경로로 시도
        this.$router.push(`/products/${id}`);
      }
    },
    
    // 위시리스트 토글 이벤트 핸들러
    handleWishlistToggle(productId) {
      console.log('프로필 페이지에서 위시리스트 토글 이벤트 수신:', productId);
      
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
          
          // Vue의 반응성을 위해 배열 요소 강제 업데이트
          this.$set(this.myProducts, productIndex, { ...this.myProducts[productIndex] });
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
    }
  }
}
</script>
