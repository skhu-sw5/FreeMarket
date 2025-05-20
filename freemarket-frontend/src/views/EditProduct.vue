<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <main class="py-8">
      <div class="container mx-auto px-4 max-w-3xl">
        <div class="flex items-center mb-6">
          <router-link 
            :to="{ name: 'ProductDetail', params: { id: productId } }"
            class="text-blue-600 hover:text-blue-800 mr-3"
          >
            <i class="fas fa-arrow-left"></i>
          </router-link>
          <h1 class="text-2xl font-bold">상품 수정</h1>
        </div>
        
        <!-- 로딩 상태 -->
        <div v-if="loading" class="bg-white rounded-lg shadow-sm p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-8 bg-gray-200 rounded"></div>
            <div class="h-8 bg-gray-200 rounded w-1/2"></div>
            <div class="h-32 bg-gray-200 rounded"></div>
            <div class="h-8 bg-gray-200 rounded w-1/3"></div>
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
                <div class="mt-2">
                  <button 
                    @click="loadProduct" 
                    class="text-sm text-red-700 hover:text-red-600 font-medium"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 상품 정보 없음 -->
        <div v-else-if="!product" class="bg-white rounded-lg shadow-sm p-8 text-center">
          <p class="text-gray-500 mb-4">상품 정보를 찾을 수 없습니다.</p>
          <router-link 
            to="/products" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
          >
            상품 목록으로 돌아가기
          </router-link>
        </div>
        
        <!-- 상품 수정 폼 -->
        <form v-else @submit.prevent="submitProduct" class="bg-white rounded-lg shadow-sm p-6">
          <!-- 상품명 -->
          <div class="mb-6">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">상품명</label>
            <input 
              id="name"
              v-model="productForm.name"
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
                v-model="productForm.price"
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
              v-model="productForm.stock"
              type="number"
              class="w-full p-2 border border-gray-300 rounded-md"
              placeholder="수량을 입력하세요"
              min="0"
              required
            />
          </div>
          
          <!-- 카테고리 -->
          <div class="mb-6">
            <label for="category" class="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <select 
              id="category"
              v-model="productForm.category"
              class="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="" disabled>카테고리 선택</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <!-- 상품 상태 -->
          <div class="mb-6">
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">상품 상태</label>
            <select 
              id="status"
              v-model="productForm.status"
              class="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option v-for="status in statusOptions" :key="status.id" :value="status.id">
                {{ status.name }}
              </option>
            </select>
          </div>
          
          <!-- 상품 설명 -->
          <div class="mb-6">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">상품 설명</label>
            <textarea 
              id="description"
              v-model="productForm.description"
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
              :to="{ name: 'ProductDetail', params: { id: productId } }" 
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </router-link>
            <button 
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              :disabled="submitting"
            >
              <span v-if="submitting">저장 중...</span>
              <span v-else>변경사항 저장</span>
            </button>
          </div>
        </form>
      </div>
    </main>
    
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'EditProduct',
  
  components: {
    AppHeader,
    AppFooter
  },
  
  data() {
    return {
      productId: null,
      productForm: {
        name: '',
        price: '',
        stock: 1,
        category: '',
        status: 'ACTIVE',
        description: ''
      },
      previewImages: [],
      submitting: false,
      error: null,
      categories: [
        { id: 'BOOKS', name: '교재/서적' },
        { id: 'ELECTRONICS', name: '전자기기' },
        { id: 'FASHION', name: '의류/패션' },
        { id: 'BEAUTY', name: '화장품/미용' },
        { id: 'SPORTS', name: '스포츠/레저' },
        { id: 'HOUSEHOLD', name: '생활용품' },
        { id: 'HOBBY', name: '취미/게임' },
        { id: 'OTHERS', name: '기타' }
      ],
      statusOptions: [
        { id: 'ACTIVE', name: '판매중' },
        { id: 'SOLD_OUT', name: '품절' },
        { id: 'INACTIVE', name: '판매중지' }
      ]
    }
  },
  
  computed: {
    ...mapState('products', ['product', 'loading']),
    ...mapState('auth', ['isAuthenticated', 'user'])
  },
  
  created() {
    // 인증 확인
    if (!this.isAuthenticated) {
      this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
      return;
    }
    
    // 상품 ID 가져오기
    this.productId = this.$route.params.id
    
    if (this.productId) {
      this.loadProduct()
    } else {
      this.error = '상품 ID가 제공되지 않았습니다.'
    }
  },
  
  methods: {
    ...mapActions('products', ['fetchProduct', 'updateProduct']),
    
    async loadProduct() {
      this.error = null
      
      try {
        await this.fetchProduct(this.productId)
        
        // 가져온 상품 정보로 폼 초기화
        if (this.product) {
          const productData = this.product.product
          
          this.productForm = {
            name: productData.name,
            price: productData.price,
            stock: productData.stock,
            category: productData.category,
            status: productData.status,
            description: productData.description
          }
          
          // 이미지 미리보기 설정
          this.previewImages = productData.imageUrls.map(url => ({
            preview: url,
            url: url // 기존 이미지 URL 저장
          }))
          
          // 판매자 확인 (본인이 등록한 상품만 수정 가능)
          if (productData.sellerName !== this.user.username) {
            this.error = '본인이 등록한 상품만 수정할 수 있습니다.'
          }
        }
      } catch (error) {
        this.error = error.message || '상품 정보를 불러오는데 실패했습니다.'
      }
    },
    
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
      this.submitting = true
      
      try {
        // 상품 데이터 준비
        const productData = {
          name: this.productForm.name,
          price: parseInt(this.productForm.price),
          stock: parseInt(this.productForm.stock),
          category: this.productForm.category,
          status: this.productForm.status,
          description: this.productForm.description
        }
        
        // 이미지 파일 또는 URL 준비
        const images = this.previewImages.map(item => item.file || item.url)
        
        // 상품 수정 API 호출
        const response = await this.updateProduct({ 
          productId: this.productId, 
          productData, 
          images 
        })
        
        // 성공 시 상품 상세 페이지로 이동
        this.$router.push({ 
          name: 'ProductDetail', 
          params: { id: response.id || this.productId },
          query: { updated: 'true' }
        })
      } catch (error) {
        console.error('상품 수정 오류:', error)
        alert(error.message || '상품 수정 중 오류가 발생했습니다. 다시 시도해주세요.')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script> 