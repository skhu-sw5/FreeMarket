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
    // 상품별 리뷰 목록 조회 - 현재는 mock 데이터 사용 (백엔드 API 없음)
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
    
    // 단일 리뷰 조회 - 실제 API 연동
    async fetchReview({ commit, rootState }, reviewId) {
      commit('SET_LOADING', true);
      
      try {
        console.log(`리뷰 상세 조회 요청: 리뷰 ID ${reviewId}`);
        
        // 헤더 설정
        const headers = {
          'Accept': 'application/json'
        };
        
        if (rootState.auth.token) {
          headers['Authorization'] = `Bearer ${rootState.auth.token}`;
        }
        
        // API 호출 URL
        const url = `/api/reviews/${reviewId}`;
        
        // 리뷰 상세 요청
        const response = await fetch(url, {
          method: 'GET',
          headers,
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('리뷰를 찾을 수 없습니다.');
          }
          throw new Error(`리뷰 조회에 실패했습니다. 상태 코드: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('리뷰 상세 API 응답 데이터:', data);
        
        // 데이터 확인 및 상태 업데이트
        if (data && data.data) {
          commit('SET_REVIEW', data.data);
          commit('SET_LOADING', false);
          return data.data;
        } else {
          throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        console.error('리뷰 상세 조회 오류:', error);
        commit('SET_ERROR', error.message);
        commit('SET_LOADING', false);
        throw error;
      }
    },
    
    // 내가 작성한 리뷰 목록 조회 - 실제 API 연동
    async fetchMyReviews({ commit, rootState }, { page = 0, size = 10 }) {
      commit('SET_LOADING', true);
      
      try {
        console.log(`내 리뷰 목록 조회 요청: 페이지 ${page}, 사이즈 ${size}`);
        
        // 인증 상태 확인
        if (!rootState.auth.token) {
          throw new Error('로그인이 필요합니다.');
        }
        
        // 헤더 설정
        const headers = {
          'Accept': 'application/json',
          'Authorization': `Bearer ${rootState.auth.token}`
        };
        
        // API 호출 URL
        const url = `/api/reviews/me?page=${page}&size=${size}`;
        
        // 내 리뷰 목록 요청
        const response = await fetch(url, {
          method: 'GET',
          headers,
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
          }
          throw new Error(`내 리뷰 목록 조회에 실패했습니다. 상태 코드: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('내 리뷰 목록 API 응답 데이터:', data);
        
        // 데이터 확인 및 상태 업데이트
        if (data && data.data) {
          const reviews = data.data.reviews || [];
          const totalPages = data.data.totalPages || 0;
          const totalElements = data.data.totalElements || 0;
          
          commit('SET_MY_REVIEWS', {
            reviews,
            totalPages,
            totalElements
          });
          
          commit('SET_LOADING', false);
          return {
            content: reviews,
            totalPages,
            totalElements
          };
        } else {
          throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        console.error('내 리뷰 목록 조회 오류:', error);
        commit('SET_ERROR', error.message);
        commit('SET_LOADING', false);
        
        // 오류 시 빈 배열로 설정
        commit('SET_MY_REVIEWS', {
          reviews: [],
          totalPages: 0,
          totalElements: 0
        });
        
        throw error;
      }
    },
    
    // 사용자가 받은 리뷰 목록 조회 - 실제 API 연동
    async fetchUserReviews({ commit, rootState }, { userId, page = 0, size = 10 }) {
      commit('SET_LOADING', true);
      
      try {
        console.log(`사용자가 받은 리뷰 목록 조회 요청: 사용자 ID ${userId}, 페이지 ${page}, 사이즈 ${size}`);
        
        // 헤더 설정
        const headers = {
          'Accept': 'application/json'
        };
        
        if (rootState.auth.token) {
          headers['Authorization'] = `Bearer ${rootState.auth.token}`;
        }
        
        // API 호출 URL
        const url = `/api/reviews/users/${userId}?page=${page}&size=${size}`;
        
        // 사용자 리뷰 목록 요청
        const response = await fetch(url, {
          method: 'GET',
          headers,
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('사용자를 찾을 수 없습니다.');
          }
          throw new Error(`사용자 리뷰 목록 조회에 실패했습니다. 상태 코드: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('사용자 리뷰 목록 API 응답 데이터:', data);
        
        // 데이터 확인 및 상태 업데이트
        if (data && data.data) {
          const reviews = data.data.reviews || [];
          const totalPages = data.data.totalPages || 0;
          const totalElements = data.data.totalElements || 0;
          
          commit('SET_RECEIVED_REVIEWS', {
            reviews,
            totalPages,
            totalElements
          });
          
          commit('SET_LOADING', false);
          return {
            content: reviews,
            totalPages,
            totalElements,
            stats: data.data.stats
          };
        } else {
          throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        console.error('사용자 리뷰 목록 조회 오류:', error);
        commit('SET_ERROR', error.message);
        commit('SET_LOADING', false);
        
        // 오류 시 빈 배열로 설정
        commit('SET_RECEIVED_REVIEWS', {
          reviews: [],
          totalPages: 0,
          totalElements: 0
        });
        
        throw error;
      }
    },
    
    // 리뷰 작성 - 실제 API 연동
    async createReview({ commit, rootState }, { productId, reviewData }) {
      commit('SET_LOADING', true);
      
      try {
        console.log(`리뷰 작성 요청: 상품 ID ${productId}, 데이터:`, reviewData);
        
        // 인증 상태 확인
        if (!rootState.auth.token) {
          throw new Error('로그인이 필요합니다.');
        }
        
        // 요청 데이터 구성
        const requestData = {
          productId,
          rating: reviewData.rating,
          content: reviewData.content
        };
        
        // 헤더 설정
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${rootState.auth.token}`
        };
        
        // API 호출 URL
        const url = `/api/reviews`;
        
        // 리뷰 작성 요청
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestData),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `리뷰 작성에 실패했습니다. 상태 코드: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('리뷰 작성 API 응답 데이터:', data);
        
        // 데이터 확인 및 상태 업데이트
        if (data && data.data) {
          commit('ADD_REVIEW', data.data);
          commit('SET_LOADING', false);
          return data.data;
        } else {
          throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        console.error('리뷰 작성 오류:', error);
        commit('SET_ERROR', error.message);
        commit('SET_LOADING', false);
        throw error;
      }
    },
    
    // 리뷰 수정 - 실제 API 연동
    async updateReview({ commit, rootState }, { reviewId, reviewData, images = [] }) {
      commit('SET_LOADING', true);
      
      try {
        console.log(`리뷰 수정 요청: 리뷰 ID ${reviewId}, 데이터:`, reviewData);
        console.log('업로드할 이미지:', images);
        
        // 인증 상태 확인
        if (!rootState.auth.token) {
          throw new Error('로그인이 필요합니다.');
        }
        
        // FormData 사용하여 데이터와 이미지 함께 전송
        const formData = new FormData();
        
        // 리뷰 데이터를 JSON으로 변환하여 추가
        const reviewBlob = new Blob(
          [JSON.stringify({ rating: reviewData.rating, content: reviewData.content })], 
          { type: 'application/json' }
        );
        formData.append('review', reviewBlob);
        
        // 이미지 파일 추가
        if (images && images.length > 0) {
          for (const image of images) {
            formData.append('images', image);
            console.log('이미지 추가:', image.name, image.type, image.size);
          }
        }
        
        // API 호출 URL
        const url = `/api/reviews/${reviewId}`;
        
        // 헤더 설정 (FormData 사용 시 Content-Type은 자동으로 설정됨)
        const headers = {
          'Authorization': `Bearer ${rootState.auth.token}`,
          'Accept': 'application/json'
        };
        
        // 리뷰 수정 요청
        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: formData,
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `리뷰 수정에 실패했습니다. 상태 코드: ${response.status}`;
          
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            console.error('오류 응답 파싱 실패:', e);
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('리뷰 수정 API 응답 데이터:', data);
        
        // 데이터 확인 및 상태 업데이트
        if (data && data.data) {
          commit('UPDATE_REVIEW', data.data);
          commit('SET_LOADING', false);
          return data.data;
        } else {
          throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        console.error('리뷰 수정 오류:', error);
        commit('SET_ERROR', error.message);
        commit('SET_LOADING', false);
        throw error;
      }
    },
    
    // 리뷰 삭제 - 실제 API 연동
    async deleteReview({ commit, rootState }, reviewId) {
      commit('SET_LOADING', true);
      
      try {
        console.log(`리뷰 삭제 요청: 리뷰 ID ${reviewId}`);
        
        // 인증 상태 확인
        if (!rootState.auth.token) {
          throw new Error('로그인이 필요합니다.');
        }
        
        // 헤더 설정
        const headers = {
          'Accept': 'application/json',
          'Authorization': `Bearer ${rootState.auth.token}`
        };
        
        // API 호출 URL
        const url = `/api/reviews/${reviewId}`;
        
        // 리뷰 삭제 요청
        const response = await fetch(url, {
          method: 'DELETE',
          headers,
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `리뷰 삭제에 실패했습니다. 상태 코드: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('리뷰 삭제 API 응답 데이터:', data);
        
        // 상태 업데이트
        commit('REMOVE_REVIEW', reviewId);
        commit('SET_LOADING', false);
        return { success: true };
      } catch (error) {
        console.error('리뷰 삭제 오류:', error);
        commit('SET_ERROR', error.message);
        commit('SET_LOADING', false);
        throw error;
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
