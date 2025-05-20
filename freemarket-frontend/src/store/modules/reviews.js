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
    // 상품별 리뷰 목록 조회
    async fetchProductReviews({ commit, rootState }, { productId, page = 0, size = 10, append = false }) {
      if (!append) {
        commit('SET_LOADING', true)
      }
      
      try {
        // 헤더 설정
        const headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
        
        if (rootState.auth.token) {
          headers['Authorization'] = `Bearer ${rootState.auth.token}`
        }
        
        // API 호출
        const response = await fetch(`/api/products/${productId}/reviews?page=${page}&size=${size}`, {
          headers,
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error(`리뷰 목록을 불러오는데 실패했습니다. 상태 코드: ${response.status}`)
        }
        
        const data = await response.json()
        
        // 상태 업데이트
        if (append) {
          commit('ADD_PRODUCT_REVIEWS', {
            reviews: data.content || []
          })
        } else {
          commit('SET_PRODUCT_REVIEWS', {
            reviews: data.content || [],
            totalPages: data.totalPages || 0,
            totalElements: data.totalElements || 0
          })
        }
        
        commit('SET_LOADING', false)
        return data
      } catch (error) {
        console.error('상품별 리뷰 목록 조회 오류:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    // 단일 리뷰 조회
    async fetchReview({ commit, rootState }, reviewId) {
      commit('SET_LOADING', true)
      
      try {
        const headers = {}
        if (rootState.auth.token) {
          headers['Authorization'] = `Bearer ${rootState.auth.token}`
        }
        
        const response = await fetch(`/api/reviews/${reviewId}`, {
          headers,
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('리뷰 정보를 불러오는데 실패했습니다.')
        }
        
        const data = await response.json()
        commit('SET_REVIEW', data.data)
        
        commit('SET_LOADING', false)
        return data.data
      } catch (error) {
        console.error('리뷰 상세 조회 오류:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    // 내가 작성한 리뷰 목록 조회
    async fetchMyReviews({ commit, rootState }, { page = 0, size = 10 }) {
      commit('SET_LOADING', true)
      
      try {
        // 토큰이 없으면 에러
        if (!rootState.auth.token) {
          throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.')
        }
        
        const response = await fetch(`/api/reviews/my?page=${page}&size=${size}`, {
          headers: {
            'Authorization': `Bearer ${rootState.auth.token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('내가 작성한 리뷰 목록을 불러오는데 실패했습니다.')
        }
        
        const data = await response.json()
        
        commit('SET_MY_REVIEWS', {
          reviews: data.data.content || [],
          totalPages: data.data.totalPages || 0,
          totalElements: data.data.totalElements || 0
        })
        
        commit('SET_LOADING', false)
        return data.data
      } catch (error) {
        console.error('내 리뷰 목록 조회 오류:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    // 사용자가 받은 리뷰 목록 조회
    async fetchUserReviews({ commit, rootState }, { username, page = 0, size = 10 }) {
      commit('SET_LOADING', true)
      
      try {
        const headers = {}
        if (rootState.auth.token) {
          headers['Authorization'] = `Bearer ${rootState.auth.token}`
        }
        
        const response = await fetch(`/api/reviews/user/${username}?page=${page}&size=${size}`, {
          headers,
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('사용자 리뷰 목록을 불러오는데 실패했습니다.')
        }
        
        const data = await response.json()
        
        commit('SET_RECEIVED_REVIEWS', {
          reviews: data.data.content || [],
          totalPages: data.data.totalPages || 0,
          totalElements: data.data.totalElements || 0
        })
        
        commit('SET_LOADING', false)
        return data.data
      } catch (error) {
        console.error('사용자 리뷰 목록 조회 오류:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    // 리뷰 작성
    async createReview({ commit, rootState }, { productId, reviewData, images }) {
      commit('SET_LOADING', true)
      
      try {
        // 토큰이 없으면 에러
        if (!rootState.auth.token) {
          throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.')
        }
        
        // FormData 생성 (이미지 업로드를 위해)
        const formData = new FormData()
        
        // reviewData를 JSON 문자열로 변환하여 FormData에 추가
        const reviewBlob = new Blob([JSON.stringify(reviewData)], {
          type: 'application/json'
        })
        formData.append('request', reviewBlob)
        
        // 이미지 파일 추가
        if (images && images.length > 0) {
          for (const image of images) {
            if (image instanceof File) {
              formData.append('images', image)
            }
          }
        }
        
        const response = await fetch(`/api/products/${productId}/reviews`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${rootState.auth.token}`
            // Content-Type은 FormData 사용 시 자동 설정됨
          },
          body: formData,
          credentials: 'include'
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || '리뷰 작성에 실패했습니다.')
        }
        
        const data = await response.json()
        
        // 새 리뷰를 목록에 추가
        commit('ADD_REVIEW', data.data)
        commit('SET_LOADING', false)
        return data.data
      } catch (error) {
        console.error('리뷰 작성 오류:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    // 리뷰 수정
    async updateReview({ commit, rootState }, { reviewId, reviewData, images }) {
      commit('SET_LOADING', true)
      
      try {
        // 토큰이 없으면 에러
        if (!rootState.auth.token) {
          throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.')
        }
        
        // FormData 생성 (이미지 업로드를 위해)
        const formData = new FormData()
        
        // reviewData를 JSON 문자열로 변환하여 FormData에 추가
        const reviewBlob = new Blob([JSON.stringify(reviewData)], {
          type: 'application/json'
        })
        formData.append('request', reviewBlob)
        
        // 이미지 파일 추가
        if (images && images.length > 0) {
          for (const image of images) {
            if (image instanceof File) {
              formData.append('images', image)
            }
          }
        }
        
        const response = await fetch(`/api/reviews/${reviewId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${rootState.auth.token}`
            // Content-Type은 FormData 사용 시 자동 설정됨
          },
          body: formData,
          credentials: 'include'
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || '리뷰 수정에 실패했습니다.')
        }
        
        const data = await response.json()
        
        // 수정된 리뷰로 상태 업데이트
        commit('UPDATE_REVIEW', data.data)
        commit('SET_LOADING', false)
        return data.data
      } catch (error) {
        console.error('리뷰 수정 오류:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    // 리뷰 삭제
    async deleteReview({ commit, rootState }, reviewId) {
      commit('SET_LOADING', true)
      
      try {
        // 토큰이 없으면 에러
        if (!rootState.auth.token) {
          throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.')
        }
        
        const response = await fetch(`/api/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${rootState.auth.token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || '리뷰 삭제에 실패했습니다.')
        }
        
        // 리뷰 삭제 후 상태 업데이트
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