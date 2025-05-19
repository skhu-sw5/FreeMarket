<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <main class="py-6">
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
                <p class="text-gray-500">가입일: {{ formatDate(user?.createdAt) }}</p>
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
                    <h3 class="text-sm font-medium text-gray-500">주소</h3>
                    <p>{{ user?.address || '미등록' }}</p>
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
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700" for="address">주소</label>
                      <input 
                        type="text" 
                        id="address" 
                        v-model="form.address" 
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
              <ProductCard 
                v-for="product in myProducts" 
                :key="product.product.id"
                :product="product.product"
                :stats="product.stats"
                @click="goToProduct(product.product.id)"
              />
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
        phone: '',
        address: ''
      },
      myProducts: []
    }
  },
  
  computed: {
    ...mapState('auth', ['user'])
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
        }
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
          phone: this.user.phone || '',
          address: this.user.address || ''
        }
      } else {
        this.form = {
          name: '',
          phone: '',
          address: ''
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
        console.log('내 상품 목록 가져오기 요청 - 토큰:', token.substring(0, 10) + '...');
        
        const response = await fetch('/api/products/mine', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          redirect: 'error' // 리디렉션 처리 방지
        })
        
        console.log('내 상품 목록 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.error('인증 오류: 토큰이 유효하지 않거나 만료되었습니다');
            // 토큰이 만료되었으므로 로그아웃 처리
            this.$store.commit('auth/CLEAR_AUTH');
            this.$router.push('/login');
            return;
          }
          throw new Error('내 상품 목록을 불러오는데 실패했습니다.')
        }
        
        const data = await response.json()
        console.log('내 상품 목록 응답 데이터:', data);
        
        this.myProducts = data.data.content || []
      } catch (error) {
        console.error('내 상품 목록 조회 오류:', error)
        // TypeErrors는 네트워크 오류일 가능성이 높음
        if (error.name === 'TypeError') {
          alert('서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
        }
        this.myProducts = []
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
    
    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }).format(date)
    },
    
    goToProduct(id) {
      this.$router.push({ name: 'ProductDetail', params: { id } })
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
      
      // 사용자 정보 다시 가져오기
      this.fetchUser()
        .then((userData) => {
          console.log('사용자 정보 새로고침 결과:', userData ? '성공' : '실패');
          
          if (userData) {
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
          console.log('로그아웃 성공, 로그인 페이지로 이동합니다.');
          this.$router.push('/login');
        })
        .catch(error => {
          console.error('로그아웃 처리 중 오류:', error);
          // 오류가 발생해도 로그인 페이지로 이동
          this.$router.push('/login');
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
}
</script>
