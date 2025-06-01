<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <main class="py-8">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-2xl font-bold mb-6">내가 작성한 리뷰</h1>
          
          <!-- 로딩 상태 -->
          <div v-if="loading" class="animate-pulse space-y-4">
            <div v-for="i in 3" :key="i" class="bg-white p-4 rounded-lg shadow-sm">
              <div class="flex items-center mb-3">
                <div class="w-10 h-10 bg-gray-200 rounded-md"></div>
                <div class="ml-3 space-y-1 flex-1">
                  <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
              </div>
              <div class="space-y-2">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
          
          <!-- 리뷰 없음 -->
          <div v-else-if="myReviews.length === 0" class="bg-white rounded-lg shadow-sm p-8 text-center">
            <p class="text-gray-500">작성한 리뷰가 없습니다.</p>
            <router-link 
              to="/products" 
              class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              상품 둘러보기
            </router-link>
          </div>
          
          <!-- 리뷰 목록 -->
          <div v-else class="space-y-4">
            <div v-for="review in myReviews" :key="review.id" class="bg-white p-4 rounded-lg shadow-sm">
              <div class="flex justify-between items-start">
                <div class="flex items-center">
                  <router-link 
                    :to="{ name: 'ProductDetail', params: { id: review.productId } }"
                    class="w-16 h-16 bg-gray-200 rounded-md overflow-hidden mr-3"
                  >
                    <img 
                      v-if="review.productImage" 
                      :src="review.productImage" 
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <i class="fas fa-box text-gray-400"></i>
                    </div>
                  </router-link>
                  
                  <div>
                    <router-link 
                      :to="{ name: 'ProductDetail', params: { id: review.productId } }"
                      class="font-medium hover:text-blue-600"
                    >
                      {{ review.productName }}
                    </router-link>
                    <div class="flex items-center mt-1">
                      <div class="flex">
                        <i v-for="i in 5" :key="i" class="fas fa-star text-xs" 
                          :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"></i>
                      </div>
                      <span class="ml-2 text-xs text-gray-500">{{ formatDate(review.createdAt) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="flex space-x-2">
                  <button @click="editReview(review)" class="text-gray-500 hover:text-blue-600">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="confirmDeleteReview(review.id)" class="text-gray-500 hover:text-red-600">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <p class="mt-3 text-gray-700">{{ review.content }}</p>
              
              <div v-if="review.imageUrls && review.imageUrls.length > 0" class="mt-3 flex space-x-2 overflow-x-auto">
                <img 
                  v-for="(image, index) in review.imageUrls" 
                  :key="index" 
                  :src="image" 
                  class="w-20 h-20 object-cover rounded-lg"
                  @click="openImageViewer(review.imageUrls, index)"
                />
              </div>
            </div>
          </div>
          
          <!-- 더 보기 버튼 -->
          <div v-if="hasMore" class="mt-6 text-center">
            <button 
              @click="loadMore"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              :disabled="loadingMore"
            >
              {{ loadingMore ? '로딩 중...' : '더 보기' }}
            </button>
          </div>
        </div>
      </div>
    </main>
    
    <!-- 리뷰 수정 모달 -->
    <div v-if="showEditForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">리뷰 수정</h3>
          <button @click="closeEditForm" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">평점</label>
          <div class="flex space-x-2">
            <button 
              v-for="i in 5" 
              :key="i" 
              @click="editForm.rating = i"
              class="text-2xl focus:outline-none"
            >
              <i class="fas fa-star" :class="i <= editForm.rating ? 'text-yellow-400' : 'text-gray-300'"></i>
            </button>
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">내용</label>
          <textarea 
            v-model="editForm.content"
            class="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="상품에 대한 리뷰를 작성해주세요."
          ></textarea>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">이미지 (선택사항)</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <div 
              v-for="(image, index) in editForm.images" 
              :key="index"
              class="relative w-20 h-20"
            >
              <img :src="image.preview" class="w-full h-full object-cover rounded-lg" />
              <button 
                @click="removeImage(index)"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
              >
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
            
            <label v-if="editForm.images.length < 5" class="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
              <i class="fas fa-plus text-gray-400"></i>
              <input 
                type="file" 
                accept="image/*" 
                class="hidden" 
                @change="handleImageUpload"
                multiple
              />
            </label>
          </div>
          <p class="text-xs text-gray-500">최대 5개의 이미지를 업로드할 수 있습니다.</p>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="closeEditForm"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button 
            @click="submitEdit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            :disabled="!isEditFormValid || submitting"
          >
            {{ submitting ? '저장 중...' : '저장' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 이미지 뷰어 모달 -->
    <div v-if="showImageViewer" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <button @click="closeImageViewer" class="absolute top-4 right-4 text-white text-2xl">
        <i class="fas fa-times"></i>
      </button>
      
      <div class="relative w-full max-w-4xl">
        <button 
          v-if="currentImages.length > 1" 
          @click="prevImage"
          class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <img :src="currentImages[currentImageIndex]" class="max-h-[80vh] mx-auto" />
        
        <button 
          v-if="currentImages.length > 1" 
          @click="nextImage"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
    
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'MyReviews',
  
  components: {
    AppHeader,
    AppFooter
  },
  
  data() {
    return {
      page: 0,
      size: 10,
      loadingMore: false,
      showEditForm: false,
      currentReview: null,
      editForm: {
        rating: 5,
        content: '',
        images: []
      },
      submitting: false,
      showImageViewer: false,
      currentImages: [],
      currentImageIndex: 0
    }
  },
  
  computed: {
    ...mapState({
      loading: state => state.reviews.loading,
      myReviews: state => state.reviews.myReviews,
      totalPages: state => state.reviews.totalPages
    }),
    
    hasMore() {
      return this.page < this.totalPages - 1
    },
    
    isEditFormValid() {
      return this.editForm.rating > 0 && this.editForm.content.trim().length > 0
    }
  },
  
  created() {
    this.fetchReviews()
  },
  
  methods: {
    ...mapActions('reviews', ['fetchMyReviews', 'updateReview', 'deleteReview']),
    
    async fetchReviews() {
      try {
        await this.fetchMyReviews({
          page: this.page,
          size: this.size
        })
      } catch (error) {
        console.error('내 리뷰 목록 조회 오류:', error)
        if (this.$toast) {
          this.$toast.error('리뷰를 불러오는데 실패했습니다.')
        }
      }
    },
    
    async loadMore() {
      if (this.loadingMore || !this.hasMore) return
      
      try {
        this.loadingMore = true
        this.page += 1
        await this.fetchReviews()
      } finally {
        this.loadingMore = false
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    },
    
    editReview(review) {
      this.currentReview = review
      this.editForm = {
        rating: review.rating,
        content: review.content,
        images: review.imageUrls ? review.imageUrls.map(url => ({ url, preview: url })) : []
      }
      this.showEditForm = true
    },
    
    closeEditForm() {
      this.showEditForm = false
      this.currentReview = null
    },
    
    async confirmDeleteReview(reviewId) {
      if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) return
      
      try {
        await this.deleteReview(reviewId)
        
        if (this.$toast) {
          this.$toast.success('리뷰가 삭제되었습니다.')
        }
      } catch (error) {
        console.error('리뷰 삭제 오류:', error)
        if (this.$toast) {
          this.$toast.error('리뷰 삭제에 실패했습니다.')
        }
      }
    },
    
    handleImageUpload(event) {
      const files = Array.from(event.target.files)
      const remainingSlots = 5 - this.editForm.images.length
      
      if (remainingSlots <= 0) return
      
      const selectedFiles = files.slice(0, remainingSlots)
      
      selectedFiles.forEach(file => {
        // 파일 유효성 검사 (이미지 파일만)
        if (!file.type.startsWith('image/')) {
          alert('이미지 파일만 업로드 가능합니다.')
          return
        }
        
        const reader = new FileReader()
        reader.onload = e => {
          this.editForm.images.push({
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
      this.editForm.images.splice(index, 1)
    },
    
    async submitEdit() {
      if (!this.isEditFormValid || this.submitting) return
      
      this.submitting = true
      
      try {
        const reviewData = {
          rating: this.editForm.rating,
          content: this.editForm.content
        }
        
        // 이미지 파일 추출 - 새로 추가된 이미지만 파일로 전송
        const imageFiles = this.editForm.images
          .filter(img => img.file instanceof File)
          .map(img => img.file)
        
        console.log('전송할 리뷰 데이터:', reviewData)
        console.log('전송할 이미지 파일:', imageFiles.map(f => f.name))
        
        await this.updateReview({
          reviewId: this.currentReview.id,
          reviewData,
          images: imageFiles
        })
        
        if (this.$toast) {
          this.$toast.success('리뷰가 수정되었습니다.')
        }
        
        this.closeEditForm()
      } catch (error) {
        console.error('리뷰 수정 오류:', error)
        if (this.$toast) {
          this.$toast.error(error.message || '리뷰 수정에 실패했습니다.')
        } else {
          alert(error.message || '리뷰 수정에 실패했습니다.')
        }
      } finally {
        this.submitting = false
      }
    },
    
    openImageViewer(images, index) {
      this.currentImages = images
      this.currentImageIndex = index
      this.showImageViewer = true
    },
    
    closeImageViewer() {
      this.showImageViewer = false
    },
    
    prevImage() {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.currentImages.length) % this.currentImages.length
    },
    
    nextImage() {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.currentImages.length
    }
  }
}
</script> 