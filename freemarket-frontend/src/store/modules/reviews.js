export default {
  namespaced: true,
  
  state: {
    productReviews: [],
    myReviews: [],
    receivedReviews: [],
    review: null,
    loading: false,
    error: null,
    totalPages: 0,
    totalElements: 0
  },
  
  mutations: {
    SET_PRODUCT_REVIEWS(state, { reviews, totalPages, totalElements }) {
      state.productReviews = reviews
      state.totalPages = totalPages
      state.totalElements = totalElements || 0
    },
    
    ADD_PRODUCT_REVIEWS(state, { reviews }) {
      state.productReviews = [...state.productReviews, ...reviews]
    },
    
    SET_MY_REVIEWS(state, { reviews, totalPages, totalElements }) {
      state.myReviews = reviews
      state.totalPages = totalPages
      state.totalElements = totalElements || 0
    },
    
    SET_RECEIVED_REVIEWS(state, { reviews, totalPages, totalElements }) {
      state.receivedReviews = reviews
      state.totalPages = totalPages
      state.totalElements = totalElements || 0
    },
    
    SET_REVIEW(state, review) {
      state.review = review
    },
    
    ADD_REVIEW(state, review) {
      state.productReviews.unshift(review)
    },
    
    UPDATE_REVIEW(state, updatedReview) {
      const index = state.productReviews.findIndex(r => r.id === updatedReview.id)
      if (index !== -1) {
        state.productReviews.splice(index, 1, updatedReview)
      }
      
      const myIndex = state.myReviews.findIndex(r => r.id === updatedReview.id)
      if (myIndex !== -1) {
        state.myReviews.splice(myIndex, 1, updatedReview)
      }
    },
    
    REMOVE_REVIEW(state, reviewId) {
      state.productReviews = state.productReviews.filter(r => r.id !== reviewId)
      state.myReviews = state.myReviews.filter(r => r.id !== reviewId)
    },
    
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    // 상품별 리뷰 목록 조회 - 빈 리뷰 목록 반환
    async fetchProductReviews({ commit, rootState }, { productId, page = 0, size = 10, append = false }) {
      if (!append) {
        commit('SET_LOADING', true)
      }
      
      try {
        console.log(`리뷰 데이터 요청: 상품 ID ${productId}, 페이지 ${page}, 사이즈 ${size}`);
        
        // 짧은 지연 시간 추가
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 빈 리뷰 목록 생성
        const mockReviews = [];
        
        // 페이징 정보
        const totalElements = 0;
        const totalPages = 0;
        
        // 상태 업데이트
        if (append) {
          commit('ADD_PRODUCT_REVIEWS', {
            reviews: mockReviews
          });
        } else {
          commit('SET_PRODUCT_REVIEWS', {
            reviews: mockReviews,
            totalPages: totalPages,
            totalElements: totalElements
          });
        }
        
        commit('SET_LOADING', false);
        return { 
          content: mockReviews, 
          totalPages, 
          totalElements 
        };
      } catch (error) {
        console.error('상품별 리뷰 목록 조회 오류:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        
        // 오류 발생 시 빈 결과 반환 (UI가 깨지지 않도록)
        if (append) {
          // 추가 로딩이면 기존 상태 유지
        } else {
          // 첫 로딩이면 빈 배열로 설정
          commit('SET_PRODUCT_REVIEWS', {
            reviews: [],
            totalPages: 0,
            totalElements: 0
          });
        }
        
        throw error
      }
    },
    
    // 단일 리뷰 조회 - 빈 리뷰 반환
    async fetchReview({ commit, rootState }, reviewId) {
      commit('SET_LOADING', true)
      
      try {
        // 짧은 지연 시간 추가
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 리뷰를 찾을 수 없음 상태 반환
        commit('SET_REVIEW', null)
        commit('SET_LOADING', false)
        
        // 리뷰를 찾을 수 없다는 오류 발생
        throw new Error('리뷰를 찾을 수 없습니다.');
      } catch (error) {
        console.error('리뷰 상세 조회 오류:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    // 내가 작성한 리뷰 목록 조회 - 빈 목록 반환
    async fetchMyReviews({ commit, rootState }, { page = 0, size = 10 }) {
      commit('SET_LOADING', true)
      
      try {
        // 짧은 지연 시간 추가
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 빈 리뷰 목록
        const mockReviews = [];
        
        // 페이징 정보
        const totalElements = 0;
        const totalPages = 0;
        
        commit('SET_MY_REVIEWS', {
          reviews: mockReviews,
          totalPages: totalPages,
          totalElements: totalElements
        })
        
        commit('SET_LOADING', false)
        return { content: mockReviews, totalPages, totalElements }
      } catch (error) {
        console.error('내 리뷰 목록 조회 오류:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        
        // 오류 시 빈 배열로 설정
        commit('SET_MY_REVIEWS', {
          reviews: [],
          totalPages: 0,
          totalElements: 0
        })
        
        throw error
      }
    },
    
    // 사용자가 받은 리뷰 목록 조회 - 빈 목록 반환
    async fetchUserReviews({ commit, rootState }, { username, page = 0, size = 10 }) {
      commit('SET_LOADING', true)
      
      try {
        // 짧은 지연 시간 추가
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 빈 리뷰 목록
        const mockReviews = [];
        
        // 페이징 정보
        const totalElements = 0;
        const totalPages = 0;
        
        commit('SET_RECEIVED_REVIEWS', {
          reviews: mockReviews,
          totalPages: totalPages,
          totalElements: totalElements
        })
        
        commit('SET_LOADING', false)
        return { content: mockReviews, totalPages, totalElements }
      } catch (error) {
        console.error('사용자 리뷰 목록 조회 오류:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        
        // 오류 시 빈 배열로 설정
        commit('SET_RECEIVED_REVIEWS', {
          reviews: [],
          totalPages: 0,
          totalElements: 0
        })
        
        throw error
      }
    },
    
    // 리뷰 작성 - 모의 구현
    async createReview({ commit, rootState, state }, { productId, reviewData }) {
      commit('SET_LOADING', true)
      
      try {
        // 로그인 체크
        if (!rootState.auth.isAuthenticated) {
          throw new Error('로그인이 필요합니다.');
        }
        
        // 지연 시간 추가
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 모의 리뷰 생성
        const mockReview = {
          id: Date.now(), // 임시 ID 생성
          ...reviewData,
          createdAt: new Date().toISOString(),
          authorId: rootState.auth.user?.id || 999,
          authorName: rootState.auth.user?.name || "사용자",
          productId: productId,
          imageUrls: []
        };
        
        // 새 리뷰를 목록에 추가
        commit('ADD_REVIEW', mockReview)
        commit('SET_LOADING', false)
        return mockReview
      } catch (error) {
        console.error('리뷰 작성 오류:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    // 리뷰 수정 - 모의 구현
    async updateReview({ commit, rootState, state }, { reviewId, reviewData }) {
      commit('SET_LOADING', true)
      
      try {
        // 로그인 체크
        if (!rootState.auth.isAuthenticated) {
          throw new Error('로그인이 필요합니다.');
        }
        
        // 기존 리뷰 조회
        const existingReview = state.productReviews.find(r => r.id === reviewId) || 
                              state.myReviews.find(r => r.id === reviewId);
        
        if (!existingReview) {
          throw new Error('리뷰를 찾을 수 없습니다.');
        }
        
        // 리뷰 소유자 체크
        if (existingReview.authorId !== rootState.auth.user?.id) {
          throw new Error('본인이 작성한 리뷰만 수정할 수 있습니다.');
        }
        
        // 지연 시간 추가
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 모의 리뷰 업데이트
        const updatedReview = {
          ...existingReview,
          ...reviewData,
          updatedAt: new Date().toISOString()
        };
        
        // 리뷰 업데이트
        commit('UPDATE_REVIEW', updatedReview);
        commit('SET_LOADING', false);
        return updatedReview;
      } catch (error) {
        console.error('리뷰 수정 오류:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    // 리뷰 삭제 - 모의 구현
    async deleteReview({ commit, rootState, state }, reviewId) {
      commit('SET_LOADING', true)
      
      try {
        // 로그인 체크
        if (!rootState.auth.isAuthenticated) {
          throw new Error('로그인이 필요합니다.');
        }
        
        // 기존 리뷰 조회
        const existingReview = state.productReviews.find(r => r.id === reviewId) || 
                              state.myReviews.find(r => r.id === reviewId);
        
        if (!existingReview) {
          throw new Error('리뷰를 찾을 수 없습니다.');
        }
        
        // 리뷰 소유자 체크
        if (existingReview.authorId !== rootState.auth.user?.id) {
          throw new Error('본인이 작성한 리뷰만 삭제할 수 있습니다.');
        }
        
        // 지연 시간 추가
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 리뷰 삭제
        commit('REMOVE_REVIEW', reviewId)
        commit('SET_LOADING', false)
        return true
      } catch (error) {
        console.error('리뷰 삭제 오류:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    }
  },
  
  getters: {
    getReviewById: (state) => (id) => {
      if (state.review && state.review.id === id) {
        return state.review
      }
      
      const review = state.productReviews.find(r => r.id === id)
      if (review) return review
      
      const myReview = state.myReviews.find(r => r.id === id)
      if (myReview) return myReview
      
      return null
    },
    
    hasMoreProductReviews: (state) => {
      return state.productReviews.length < state.totalElements
    },
    
    averageRating: (state) => {
      if (state.productReviews.length === 0) return 0
      const sum = state.productReviews.reduce((acc, review) => acc + review.rating, 0)
      return sum / state.productReviews.length
    }
  }
} 
