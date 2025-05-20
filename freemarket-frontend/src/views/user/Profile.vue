<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <AppHeader />
    
    <main class="py-6 flex-grow">
      <div class="container mx-auto px-4">
        <h1 class="text-2xl font-bold mb-6">내 프로필</h1>
        
        <div v-if="loading" class="animate-pulse">
          <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div class="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div class="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div class="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        
        <div v-else-if="!user" class="bg-white p-6 rounded-lg shadow-sm mb-6 text-center">
          <p class="text-red-500 mb-4">사용자 정보를 불러올 수 없습니다.</p>
          <div class="flex space-x-4 justify-center">
            <button 
              @click="reloadPage" 
              class="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
            >
              새로고침
            </button>
            <button 
              @click="logout" 
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition-colors"
            >
              로그아웃 후 다시 로그인
            </button>
          </div>
        </div>
        
        <div v-else>
          <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div class="flex flex-col md:flex-row">
              <div class="md:w-64 flex flex-col items-center md:border-r md:pr-6">
                <div class="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <i class="fas fa-user text-gray-400 text-4xl"></i>
                </div>
                <h2 class="text-xl font-bold">{{ user?.name }}</h2>
              </div>
              
              <div class="md:flex-1 md:pl-6 mt-6 md:mt-0">
                <div class="space-y-4">
                  <div>
                    <h3 class="text-sm font-medium text-gray-500">이메일</h3>
                    <p>{{ user?.email }}</p>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-500">연락처</h3>
                    <p>{{ user?.phone || '미등록' }}</p>
                  </div>
                  <div>
                    <h3 class="text-sm font-medium text-gray-500">학교 이메일 인증</h3>
                    <div class="flex items-center">
                      <span v-if="isEmailVerified" class="text-green-600 font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        인증 완료
                      </span>
                      <span v-else class="text-red-600 font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        인증 필요
                      </span>
                      <button 
                        v-if="!isEmailVerified" 
                        @click="goToEmailVerification" 
                        class="ml-3 px-2 py-1 bg-blue-600 text-white text-sm rounded font-medium hover:bg-blue-700 transition-colors"
                      >
                        인증하기
                      </button>
                    </div>
                  </div>
                </div>
                
                <div class="mt-6">
                  <button 
                    @click="isEditMode = true" 
                    class="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
                    v-if="!isEditMode"
                  >
                    프로필 수정
                  </button>
                </div>
                
                <form v-if="isEditMode" class="mt-6" @submit.prevent="updateProfile">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700" for="name">이름</label>
                      <input 
                        type="text" 
                        id="name" 
                        v-model="form.name" 
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700" for="phone">연락처</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        v-model="form.phone" 
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div class="flex space-x-4">
                      <button 
                        type="submit" 
                        class="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
                      >
                        저장
                      </button>
                      <button 
                        type="button" 
                        @click="cancelEdit"
                        class="px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <h2 class="text-xl font-bold mb-4">내 판매 상품</h2>
            
            <div v-if="myProducts.length === 0" class="text-center py-8">
              <p class="text-gray-500 mb-4">등록한 상품이 없습니다.</p>
              <router-link 
                to="/sell" 
                class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
              >
                상품 등록하기
              </router-link>
            </div>
            
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- 디버깅용 정보 표시 (개발 시에만 사용) -->
              <div v-if="$NODE_ENV === 'development'" class="text-xs text-gray-500 col-span-full mb-4">
                디버깅: {{ myProducts.length }}개 제품, 
                첫번째 제품 ID: {{ myProducts[0]?.product?.id }}
              </div>
              
              <ProductCard 
                v-for="product in myProducts" 
                :key="product.product.id || 'unknown'"
                :product="product.product"
                :stats="product.stats"
                @click="goToProduct(product.product.id)"
              />
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm mt-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">내가 작성한 리뷰</h2>
              <router-link 
                to="/user/reviews" 
                class="text-blue-600 hover:text-blue-800"
              >
                모두 보기 <i class="fas fa-arrow-right ml-1"></i>
              </router-link>
            </div>
            
            <div class="text-center py-8">
              <p class="text-gray-500 mb-4">
                내가 작성한 리뷰를 관리하고 수정할 수 있습니다.
              </p>
              <router-link 
                to="/user/reviews" 
                class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
              >
                리뷰 관리하기
              </router-link>
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
import ProductCard from '@/components/products/ProductCard.vue'
import { mapState, mapActions } from 'vuex'
import { apiGet } from '@/utils/api'

export default {
  name: 'ProfileView',
  
  components: {
    AppHeader,
    AppFooter,
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
              // 활성 상품과 판매된 상품을 합쳐서 표시
              console.log('활성 상품 데이터 구조:', data.data.activeProducts ? data.data.activeProducts[0] : null);
              console.log('판매 완료 상품 데이터 구조:', data.data.soldProducts ? data.data.soldProducts[0] : null);
              
              const activeProducts = (data.data.activeProducts || []).map(product => {
                // 상품 객체 구조 확인
                console.log('상품 객체 구조:', product);
                
                // id가 있는지 확인
                if (!product.productId && !product.id) {
                  console.warn('상품 ID가 없습니다:', product);
                }
                
                return {
                  product: {
                    ...product,
                    id: product.productId || product.id // ID 필드 보장
                  },
                  stats: { 
                    viewCount: product.viewCount || 0,
                    wishlistCount: product.wishlistCount || 0,
                    status: '판매중' 
                  }
                };
              });
              
              const soldProducts = (data.data.soldProducts || []).map(product => {
                return {
                  product: {
                    ...product,
                    id: product.productId || product.id // ID 필드 보장
                  },
                  stats: { 
                    viewCount: product.viewCount || 0,
                    wishlistCount: product.wishlistCount || 0,
                    status: '판매완료' 
                  }
                };
              });
              
              this.myProducts = [...activeProducts, ...soldProducts];
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
    
    reloadPage() {
      this.loading = true
      
      // 토큰 확인
      const token = this.$store.state.auth.token;
      console.log('새로고침 중... 현재 토큰이 있나요?', !!token);
      
      if (!token) {
        // 토큰이 없으면 로그인 페이지로 리다이렉트
        console.log('토큰이 없습니다. 로그인 페이지로 이동합니다.');
        this.loading = false;
        this.$router.push('/login');
        return;
      }
      
      // 사용자 정보 다시 가져오기 - 캐시 우회 옵션 추가
      console.log('사용자 정보를 강제 새로고침합니다...');
      
      // 먼저 현재 사용자 정보의 이메일 인증 상태 기록
      const prevEmailVerified = this.user?.emailVerified;
      console.log('이전 이메일 인증 상태:', prevEmailVerified);
      
      this.fetchUser()
        .then((userData) => {
          console.log('사용자 정보 새로고침 결과:', userData ? '성공' : '실패');
          
          if (userData) {
            // 이메일 인증 상태 변경 로그
            console.log('새로고침 후 이메일 인증 상태:', userData.emailVerified);
            console.log('이메일 인증 상태 변경 여부:', prevEmailVerified !== userData.emailVerified);
            
            this.initForm()
            return this.fetchMyProducts()
          } else {
            console.error('사용자 정보를 불러올 수 없습니다. 다시 로그인이 필요할 수 있습니다.');
            alert('사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.');
            this.$router.push('/login');
          }
        })
        .catch(error => {
          console.error('프로필 새로고침 오류:', error)
          alert('사용자 정보를 불러오는데 실패했습니다. 다시 시도해주세요.')
        })
        .finally(() => {
          this.loading = false
        })
    },
    
    logout() {
      this.loading = true;
      this.$store.dispatch('auth/logout')
        .then(() => {
          console.log('로그아웃 성공, 메인 페이지로 이동합니다.');
          this.$router.push('/'); // 로그인 페이지 대신 메인 페이지로 이동
        })
        .catch(error => {
          console.error('로그아웃 처리 중 오류:', error);
          // 오류가 발생해도 메인 페이지로 이동
          this.$router.push('/');
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
}
</script>
