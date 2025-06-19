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
      
      <div v-else-if="currentReviews.length === 0" class="text-center py-8">
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
            <h2 class="text-xl font-bold text-gray-900 mb-6">{{ reviewType === 'product' ? '상품 리뷰' : '판매자 리뷰' }}</h2>
            <div class="flex items-center mt-1">
              <div class="flex">
                <i v-for="i in 5" :key="i" class="fas fa-star" 
                  :class="i <= currentAverageRating ? 'text-yellow-400' : 'text-gray-300'"></i>
              </div>
              <span class="ml-2 text-sm text-gray-600">{{ currentAverageRating.toFixed(1) }} / 5</span>
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
          <div v-for="review in currentReviews" :key="review.id" class="bg-gray-50 p-4 rounded-lg">
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
        
        <div v-if="hasMoreCurrentReviews" class="mt-6 text-center">
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
        <div class="modal w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100">{{ editingReview ? '리뷰 수정' : '리뷰 작성' }}</h3>
            <button @click="closeReviewForm" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="mb-4">
            <label class="form-label">평점</label>
            <div class="flex space-x-2">
              <button 
                v-for="i in 5" 
                :key="i" 
                @click="reviewForm.rating = i"
                class="text-2xl focus:outline-none"
              >
                <i class="fas fa-star" :class="i <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"></i>
              </button>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="form-label">내용</label>
            <textarea 
              v-model="reviewForm.content"
              class="textarea"
              placeholder="상품에 대한 리뷰를 작성해주세요."
            ></textarea>
          </div>
          
          <div class="mb-4">
            <label class="form-label">이미지 (선택사항)</label>
            <div v-if="!editingReview" class="flex flex-wrap gap-2 mb-2">
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
              
              <label v-if="reviewForm.images.length < 5" class="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <i class="fas fa-plus text-gray-400 dark:text-gray-500"></i>
                <input 
                  type="file" 
                  accept="image/*" 
                  class="hidden" 
                  @change="handleImageUpload"
                  multiple
                />
              </label>
            </div>
            <p v-if="!editingReview" class="text-xs text-gray-500 dark:text-gray-400">최대 5개의 이미지를 업로드할 수 있습니다.</p>
            <p v-else class="text-xs text-gray-400 dark:text-gray-500">리뷰 수정 시에는 이미지를 변경할 수 없습니다.</p>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="closeReviewForm"
              class="button-outline"
            >
              취소
            </button>
            <button 
              @click="submitReview"
              class="button-primary disabled:opacity-50"
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
        required: false
      },
      sellerId: {
        type: String,
        required: false
      },
      productData: {
        type: Object,
        required: false,
        default: null
      },
      hasPurchasedProduct: {
        type: Boolean,
        required: false,
        default: false
      },
      reviewType: {
        type: String,
        required: true,
        validator: value => ['product', 'seller'].includes(value)
      }
    },
    
    data() {
      return {
        loadingMore: false,
        reviewPage: 0,
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
        productReviews: state => state.reviews.productReviews,
        receivedReviews: state => state.reviews.receivedReviews,
        user: state => state.auth.user
      }),
      
      ...mapGetters('reviews', ['averageRating', 'hasMoreProductReviews', 'hasMoreReceivedReviews']),
      
      currentReviews() {
        return this.reviewType === 'product' ? this.productReviews : this.receivedReviews;
      },

      currentAverageRating() {
        if (this.reviewType === 'product') {
          return this.averageRating;
        } else {
          if (this.receivedReviews.length === 0) return 0;
          const totalRating = this.receivedReviews.reduce((sum, review) => sum + review.rating, 0);
          return totalRating / this.receivedReviews.length;
        }
      },

      hasMoreCurrentReviews() {
        return this.reviewType === 'product' ? this.hasMoreProductReviews : this.hasMoreReceivedReviews;
      },
      
      isAuthenticated() {
        return this.$store.state.auth.isAuthenticated
      },
      
      userId() {
        return this.user?.id
      },
      
      canReview() {
        if (!this.isAuthenticated) return false;
        
        if (this.reviewType === 'product') {
          if (!this.productData || !this.productData.product || (this.productData.product.status && this.productData.product.status.trim() !== '품절')) {
            console.log('리뷰 작성 불가: 상품 상태가 판매 완료가 아님.');
            return false;
          }
          const hasExistingReviewForThisProduct = this.productReviews.some(review => 
            review.authorId === this.userId && String(review.productId) === this.productId
          );
          return this.hasPurchasedProduct && !hasExistingReviewForThisProduct;
        } else {
          return false;
        }
      },
      
      isReviewFormValid() {
        return this.reviewForm.rating > 0 && this.reviewForm.content.trim().length > 0
      }
    },
    
    created() {
      if (this.reviewType === 'product') {
        if (!this.productId) {
          console.warn('상품 리뷰 컴포넌트에 상품 ID가 제공되지 않았습니다.');
          return;
        }
        this.fetchReviewsForProduct();
      } else if (this.reviewType === 'seller') {
        if (!this.sellerId) {
          console.warn('ReviewList 컴포넌트에 판매자 ID가 제공되지 않았습니다.');
          return;
        }
        this.fetchReviewsForSeller();
      } else {
        console.error('ReviewList 컴포넌트에 유효하지 않은 reviewType이 제공되었습니다.');
      }
    },
    
    methods: {
      ...mapActions('reviews', [
        'fetchUserReviews',
        'fetchProductReviews',
        'createReview',
        'updateReview',
        'deleteReview'
      ]),
      
      async fetchReviewsForSeller() {
        try {
          if (!this.sellerId) {
            console.warn('판매자 ID가 없어 리뷰 데이터를 요청할 수 없습니다.');
            return;
          }
          
          await this.fetchUserReviews({
            userId: this.sellerId,
            page: this.reviewPage,
            size: this.size,
            append: this.reviewPage > 0
          });
        } catch (error) {
          if (this.$toast) {
            this.$toast.error('판매자 리뷰를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
          }
        }
      },
      
      async fetchReviewsForProduct() {
        try {
          if (!this.productId) {
            console.warn('상품 ID가 없어 리뷰 데이터를 요청할 수 없습니다.');
            return;
          }

          await this.fetchProductReviews({
            productId: this.productId,
            page: this.reviewPage,
            size: this.size,
            append: this.reviewPage > 0
          });
        } catch (error) {
          if (this.$toast) {
            this.$toast.error('상품 리뷰를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
          }
        }
      },
      
      async refreshReviews() {
        this.reviewPage = 0;
        if (this.reviewType === 'product') {
          await this.fetchReviewsForProduct();
        } else {
          await this.fetchReviewsForSeller();
        }
      },
      
      async loadMoreReviews() {
        if (this.loadingMore) return
        
        try {
          this.loadingMore = true
          this.reviewPage += 1
          if (this.reviewType === 'product') {
            await this.fetchReviewsForProduct();
          } else {
            await this.fetchReviewsForSeller();
          }
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
          images: []
        }
        this.showReviewForm = true
      },
      
      async confirmDeleteReview(reviewId) {
        if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) return;
        
        try {
          await this.deleteReview(reviewId);
          
          if (this.$toast) {
            this.$toast.success('리뷰가 성공적으로 삭제되었습니다.');
          }
          
          await this.refreshReviews();
        } catch (error) {
          let errorMessage = '리뷰 삭제 중 오류가 발생했습니다.';
          
          if (error.message) {
            errorMessage = error.message;
          }
          
          if (this.$toast) {
            this.$toast.error(errorMessage);
          } else {
            alert(errorMessage);
          }
        }
      },
      
      handleImageUpload(event) {
        const files = Array.from(event.target.files)
        const remainingSlots = 5 - this.reviewForm.images.length
        
        if (remainingSlots <= 0) return
        
        const selectedFiles = files.slice(0, remainingSlots)
        
        selectedFiles.forEach(file => {
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
        
        event.target.value = null
      },
      
      removeImage(index) {
        this.reviewForm.images.splice(index, 1)
      },
      
      async submitReview() {
        if (!this.isReviewFormValid || this.submitting) return;
        
        this.submitting = true;
        
        try {
          const reviewData = {
            rating: this.reviewForm.rating,
            content: this.reviewForm.content
          };
          
          if (this.editingReview) {
            await this.updateReview({
              reviewId: this.editingReview.id,
              reviewData
            });
            
            if (this.$toast) {
              this.$toast.success('리뷰가 성공적으로 수정되었습니다.');
            }
            
            this.closeReviewForm();
            await this.refreshReviews();
          } else {
            console.log('새 리뷰 생성 요청', reviewData);
            const imageFiles = this.reviewForm.images
              .filter(img => img.file)
              .map(img => img.file);
              
            await this.createReview({
              productId: this.productId,
              reviewData,
              images: imageFiles
            });

            if (this.$toast) {
              this.$toast.success('리뷰가 성공적으로 작성되었습니다.');
            }
            
            this.closeReviewForm();
            this.reviewForm.rating = 5;
            this.reviewForm.content = '';
            this.reviewForm.images = [];
            await this.refreshReviews();
          }
        } catch (error) {
          console.error('리뷰 작성/수정 오류:', error);
          let errorMessage = '리뷰 처리 중 오류가 발생했습니다.';
          
          if (error.message) {
            errorMessage = error.message;
          }
          
          if (this.$toast) {
            this.$toast.error(errorMessage);
          } else {
            alert(errorMessage);
          }
        } finally {
          this.submitting = false;
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
