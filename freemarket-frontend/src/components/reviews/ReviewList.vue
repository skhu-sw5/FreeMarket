<template>
    <div class="reviews-container">
      <div v-if="loading" class="animate-pulse space-y-4">
        <div v-for="i in 3" :key="i" class="bg-gray-100 p-4 rounded-lg">
          <div class="flex items-center mb-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
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
      
      <div v-else-if="reviews.length === 0" class="text-center py-8">
        <p class="text-gray-500">아직 리뷰가 없습니다.</p>
        <button 
          v-if="isAuthenticated && canReview" 
          @click="openReviewForm"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          첫 리뷰 작성하기
        </button>
      </div>
      
      <div v-else>
        <div class="mb-6 flex justify-between items-center">
          <div>
            <h3 class="text-lg font-medium">리뷰 {{ reviews.length }}개</h3>
            <div class="flex items-center mt-1">
              <div class="flex">
                <i v-for="i in 5" :key="i" class="fas fa-star" 
                  :class="i <= averageRating ? 'text-yellow-400' : 'text-gray-300'"></i>
              </div>
              <span class="ml-2 text-sm text-gray-600">{{ averageRating.toFixed(1) }} / 5</span>
            </div>
          </div>
          
          <button 
            v-if="isAuthenticated && canReview" 
            @click="openReviewForm"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            리뷰 작성하기
          </button>
        </div>
        
        <div class="space-y-4">
          <div v-for="review in reviews" :key="review.id" class="bg-gray-50 p-4 rounded-lg">
            <div class="flex justify-between items-start">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <i class="fas fa-user text-gray-400"></i>
                </div>
                <div class="ml-3">
                  <h4 class="font-medium">{{ review.authorName }}</h4>
                  <div class="flex items-center mt-1">
                    <div class="flex">
                      <i v-for="i in 5" :key="i" class="fas fa-star text-xs" 
                        :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"></i>
                    </div>
                    <span class="ml-2 text-xs text-gray-500">{{ formatDate(review.createdAt) }}</span>
                  </div>
                </div>
              </div>
              
              <div v-if="isAuthenticated && review.authorId === userId" class="flex space-x-2">
                <button @click="editReview(review)" class="text-gray-500 hover:text-blue-600">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteReview(review.id)" class="text-gray-500 hover:text-red-600">
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
        
        <div v-if="hasMoreReviews" class="mt-6 text-center">
          <button 
            @click="loadMoreReviews"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            :disabled="loadingMore"
          >
            {{ loadingMore ? '로딩 중...' : '더 보기' }}
          </button>
        </div>
      </div>
      
      <!-- 리뷰 작성 모달 -->
      <div v-if="showReviewForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">{{ editingReview ? '리뷰 수정' : '리뷰 작성' }}</h3>
            <button @click="closeReviewForm" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">평점</label>
            <div class="flex space-x-2">
              <button 
                v-for="i in 5" 
                :key="i" 
                @click="reviewForm.rating = i"
                class="text-2xl focus:outline-none"
              >
                <i class="fas fa-star" :class="i <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'"></i>
              </button>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">내용</label>
            <textarea 
              v-model="reviewForm.content"
              class="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="상품에 대한 리뷰를 작성해주세요."
            ></textarea>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">이미지 (선택사항)</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <div 
                v-for="(image, index) in reviewForm.images" 
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
              
              <label v-if="reviewForm.images.length < 5" class="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
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
              @click="closeReviewForm"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button 
              @click="submitReview"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              :disabled="!isReviewFormValid || submitting"
            >
              {{ submitting ? '처리 중...' : (editingReview ? '수정하기' : '작성하기') }}
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
    </div>
  </template>
  
  <script>
  import { mapState, mapGetters, mapActions } from 'vuex'
  
  export default {
    props: {
      productId: {
        type: String,
        required: true
      }
    },
    
    data() {
      return {
        loadingMore: false,
        page: 0,
        size: 5,
        showReviewForm: false,
        editingReview: null,
        reviewForm: {
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
        error: state => state.reviews.error,
        reviews: state => state.reviews.productReviews
      }),
      
      ...mapGetters('reviews', ['averageRating', 'hasMoreProductReviews']),
      
      isAuthenticated() {
        return this.$store.state.auth.isAuthenticated
      },
      
      userId() {
        return this.$store.state.auth.user?.id
      },
      
      canReview() {
        // 이미 리뷰를 작성했는지 확인
        return !this.reviews.some(review => review.authorId === this.userId)
      },
      
      hasMoreReviews() {
        return this.hasMoreProductReviews
      },
      
      isReviewFormValid() {
        return this.reviewForm.rating > 0 && this.reviewForm.content.trim().length > 0
      }
    },
    
    created() {
      this.fetchReviews()
    },
    
    methods: {
      ...mapActions('reviews', [
        'fetchProductReviews',
        'createReview',
        'updateReview',
        'deleteReview'
      ]),
      
      async fetchReviews() {
        try {
          await this.fetchProductReviews({
            productId: this.productId,
            page: this.page,
            size: this.size,
            append: this.page > 0
          })
        } catch (error) {
          console.error('리뷰 목록 조회 오류:', error)
          if (this.$toast) {
            this.$toast.error('리뷰를 불러오는데 실패했습니다.')
          }
        }
      },
      
      async loadMoreReviews() {
        if (this.loadingMore) return
        
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
      
      openReviewForm() {
        this.showReviewForm = true
        this.editingReview = null
        this.reviewForm = {
          rating: 5,
          content: '',
          images: []
        }
      },
      
      closeReviewForm() {
        this.showReviewForm = false
        this.editingReview = null
      },
      
      editReview(review) {
        this.editingReview = review
        this.reviewForm = {
          rating: review.rating,
          content: review.content,
          images: review.imageUrls ? review.imageUrls.map(url => ({ url, preview: url })) : []
        }
        this.showReviewForm = true
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
        const remainingSlots = 5 - this.reviewForm.images.length
        
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
            this.reviewForm.images.push({
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
        this.reviewForm.images.splice(index, 1)
      },
      
      async submitReview() {
        if (!this.isReviewFormValid || this.submitting) return
        
        this.submitting = true
        
        try {
          const reviewData = {
            rating: this.reviewForm.rating,
            content: this.reviewForm.content
          }
          
          // 이미지 파일 추출
          const imageFiles = this.reviewForm.images
            .filter(img => img.file)
            .map(img => img.file)
          
          if (this.editingReview) {
            // 리뷰 수정
            await this.updateReview({
              reviewId: this.editingReview.id,
              reviewData,
              images: imageFiles
            })
            
            if (this.$toast) {
              this.$toast.success('리뷰가 수정되었습니다.')
            }
          } else {
            // 새 리뷰 작성
            await this.createReview({
              productId: this.productId,
              reviewData,
              images: imageFiles
            })
            
            if (this.$toast) {
              this.$toast.success('리뷰가 작성되었습니다.')
            }
          }
          
          this.closeReviewForm()
        } catch (error) {
          console.error('리뷰 제출 오류:', error)
          if (this.$toast) {
            this.$toast.error(error.message)
          } else {
            alert(error.message)
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