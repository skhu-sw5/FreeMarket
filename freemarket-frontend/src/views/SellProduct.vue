<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <main class="py-8">
      <div class="container mx-auto px-4 max-w-3xl">
        <h1 class="text-2xl font-bold mb-6">상품 등록</h1>
        
        <!-- 이메일 인증 오류 안내 -->
        <div v-if="emailVerificationError" class="mb-6 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <i class="fas fa-exclamation-triangle text-yellow-500 mt-0.5"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">학교 이메일 인증이 필요합니다</h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>상품을 등록하려면 학교 이메일 인증이 필요합니다. 아래 버튼을 클릭하여 이메일 인증을 진행해주세요.</p>
                <div class="mt-3">
                  <router-link 
                    to="/email-verification" 
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-500 focus:outline-none focus:border-yellow-700 focus:shadow-outline-yellow active:bg-yellow-700 transition ease-in-out duration-150"
                  >
                    이메일 인증하기
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <form v-if="!emailVerificationError" @submit.prevent="submitProduct" class="bg-white rounded-lg shadow-sm p-6">
          <!-- 상품명 -->
          <div class="mb-6">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">상품명</label>
            <input 
              id="name"
              v-model="product.name"
              type="text"
              class="w-full p-2 border border-gray-300 rounded-md"
              placeholder="상품명을 입력하세요"
              required
            />
          </div>
          
          <!-- 가격 -->
          <div class="mb-6">
            <label for="price" class="block text-sm font-medium text-gray-700 mb-1">가격</label>
            <div class="relative">
              <input 
                id="price"
                v-model="product.price"
                type="number"
                class="w-full p-2 border border-gray-300 rounded-md"
                placeholder="가격을 입력하세요"
                min="100"
                required
              />
              <span class="absolute right-3 top-2 text-gray-500">원</span>
            </div>
          </div>
          
          <!-- 재고 수량 -->
          <div class="mb-6">
            <label for="stock" class="block text-sm font-medium text-gray-700 mb-1">재고 수량</label>
            <input 
              id="stock"
              v-model="product.stock"
              type="number"
              class="w-full p-2 border border-gray-300 rounded-md"
              placeholder="수량을 입력하세요"
              min="1"
              required
            />
          </div>
          
          <!-- 카테고리 -->
          <div class="mb-6">
            <label for="category" class="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <select 
              id="category"
              v-model="product.category"
              class="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="" disabled>카테고리 선택</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <!-- 상품 설명 -->
          <div class="mb-6">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">상품 설명</label>
            <textarea 
              id="description"
              v-model="product.description"
              rows="5"
              class="w-full p-2 border border-gray-300 rounded-md"
              placeholder="상품 설명을 입력하세요"
            ></textarea>
          </div>
          
          <!-- 이미지 업로드 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">상품 이미지</label>
            <div class="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
              <input 
                type="file"
                @change="handleImageUpload"
                multiple
                accept="image/*"
                class="hidden"
                ref="fileInput"
              />
              <div v-if="previewImages.length === 0">
                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                <p class="text-gray-500">이미지 파일을 드래그하거나 클릭하여 업로드하세요</p>
                <p class="text-xs text-gray-400 mt-1">최대 5개까지 가능 (JPG, PNG)</p>
                <button 
                  type="button"
                  @click="$refs.fileInput.click()"
                  class="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  파일 선택
                </button>
              </div>
              
              <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div 
                  v-for="(image, index) in previewImages" 
                  :key="index"
                  class="relative"
                >
                  <img :src="image.preview" class="w-full h-32 object-cover rounded-md" />
                  <button 
                    type="button"
                    @click="removeImage(index)"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    <i class="fas fa-times text-xs"></i>
                  </button>
                </div>
                <div 
                  v-if="previewImages.length < 5"
                  @click="$refs.fileInput.click()"
                  class="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-gray-50"
                >
                  <i class="fas fa-plus text-gray-400"></i>
                  <span class="text-sm text-gray-500 mt-1">추가</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3">
            <router-link 
              to="/products" 
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </router-link>
            <button 
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              :disabled="loading"
            >
              <span v-if="loading">등록 중...</span>
              <span v-else>상품 등록</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'SellProduct',
  
  components: {
    AppHeader
  },
  
  data() {
    return {
      product: {
        name: '',
        price: '',
        stock: 1,
        category: '',
        description: ''
      },
      previewImages: [],
      emailVerificationError: false,
      categories: [
        { id: 'BOOKS', name: '교재/서적' },
        { id: 'ELECTRONICS', name: '전자기기' },
        { id: 'FASHION', name: '의류/패션' },
        { id: 'BEAUTY', name: '화장품/미용' },
        { id: 'SPORTS', name: '스포츠/레저' },
        { id: 'HOUSEHOLD', name: '생활용품' },
        { id: 'HOBBY', name: '취미/게임' },
        { id: 'OTHERS', name: '기타' },
      ]
    }
  },
  
  computed: {
    ...mapState('products', ['loading']),
    ...mapState('auth', ['isAuthenticated', 'user'])
  },
  
  created() {
    if (!this.isAuthenticated) {
      this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
      return;
    }
    
    // 이메일 인증 완료 여부 확인
    if (this.$route.query.emailVerified === 'true') {
      this.emailVerificationError = false;
    } 
    // 이미 이메일 인증 오류가 있으면 표시
    else if (this.$route.query.emailError === 'true') {
      this.emailVerificationError = true;
    }
  },
  
  methods: {
    ...mapActions('products', ['createProduct']),
    
    handleImageUpload(event) {
      const files = event.target.files
      
      if (files.length === 0) return
      
      // 최대 5개까지만 업로드 가능
      const remainingSlots = 5 - this.previewImages.length
      const selectedFiles = Array.from(files).slice(0, remainingSlots)
      
      selectedFiles.forEach(file => {
        // 파일 유효성 검사 (이미지 파일만)
        if (!file.type.startsWith('image/')) {
          alert('이미지 파일만 업로드 가능합니다.')
          return
        }
        
        // 미리보기 생성
        const reader = new FileReader()
        reader.onload = e => {
          this.previewImages.push({
            file,
            preview: e.target.result
          })
        }
        reader.readAsDataURL(file)
      })
      
      // 파일 입력 초기화
      event.target.value = null
    },
    
    removeImage(index) {
      this.previewImages.splice(index, 1)
    },
    
    async submitProduct() {
      try {
        // FormData 객체 생성
        const productData = {
          name: this.product.name,
          price: Number(this.product.price),
          stock: Number(this.product.stock),
          category: this.product.category,
          status: 'ACTIVE',
          description: this.product.description,
          sellerName: this.user?.name || this.user?.username || ''
        }
        
        // 이미지 파일 추출
        const images = this.previewImages.map(item => item.file)
        
        const response = await this.createProduct({ productData, images })
        
        // 성공 시 상품 상세 페이지로 이동
        this.$router.push({ name: 'ProductDetail', params: { id: response.product.id } })
      } catch (error) {
        console.error('상품 등록 오류:', error)
        
        // 학교 이메일 인증 오류인 경우
        if (error.message && error.message.includes('학교 이메일 인증이 필요합니다')) {
          this.emailVerificationError = true
        } else {
          alert('상품 등록 중 오류가 발생했습니다. 다시 시도해주세요.')
        }
      }
    }
  }
}
</script>
