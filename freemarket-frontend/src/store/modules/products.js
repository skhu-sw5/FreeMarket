import { API_BASE_URL } from '@/config'

export default {
  namespaced: true,
  
  state: {
    products: [],
    product: null,
    loading: false,
    error: null,
    totalPages: 0,
    totalElements: 0,
    wishlist: [],
    skipViewIncrement: false
  },
  
  mutations: {
    SET_PRODUCTS(state, { products, totalPages, totalElements }) {
      state.products = products
      state.totalPages = totalPages
      state.totalElements = totalElements || 0
    },
    SET_PRODUCT(state, product) {
      state.product = product
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    SET_WISHLIST(state, wishlist) {
      state.wishlist = wishlist
    },
    SET_SKIP_VIEW_INCREMENT(state, skip) {
      state.skipViewIncrement = skip
    },
    TOGGLE_WISHLIST_STATUS(state, { productId, isWishlisted, wishlistCount }) {
      // 상품 상세 페이지의 위시리스트 상태 업데이트
      if (state.product && state.product.product && state.product.product.id === productId) {
        state.product.stats.isWishlisted = isWishlisted;
        if (wishlistCount !== undefined) {
          state.product.stats.wishlistCount = wishlistCount;
        }
      }
      
      // 상품 목록에서 해당 상품의 위시리스트 상태 업데이트
      const productIndex = state.products.findIndex(p => p.product && p.product.id === productId);
      if (productIndex !== -1) {
        state.products[productIndex].stats.isWishlisted = isWishlisted;
        if (wishlistCount !== undefined) {
          state.products[productIndex].stats.wishlistCount = wishlistCount;
        }
      }
      
      // 위시리스트에서 해당 상품 추가/제거
      if (isWishlisted) {
        // 위시리스트에 없으면 추가
        const wishlistIndex = state.wishlist.findIndex(item => item.id === productId);
        if (wishlistIndex === -1 && state.product && state.product.product && state.product.product.id === productId) {
          state.wishlist.push({
            id: productId,
            ...state.product.product
          });
        }
      } else {
        // 위시리스트에서 제거
        state.wishlist = state.wishlist.filter(item => item.id !== productId);
      }
    },
    UPDATE_PRODUCT_WISHLIST_STATUS(state, { productId, isWishlisted, count }) {
      // TOGGLE_WISHLIST_STATUS와 중복되므로 이 함수 내용은 생략
      // 이전 코드를 유지하기 위해 빈 함수로 남겨둠
    },
    REMOVE_FROM_WISHLIST(state, productId) {
      // TOGGLE_WISHLIST_STATUS와 중복되므로 이 함수 내용은 생략
      // 이전 코드를 유지하기 위해 빈 함수로 남겨둠
    }
  },
  
  actions: {
    // 조회수 증가 건너뛰기 상태 설정
    setSkipViewIncrement({ commit }, skip) {
      commit('SET_SKIP_VIEW_INCREMENT', skip);
    },
    
    async fetchProducts({ commit, rootState }, { page = 0, size = 12, category = null, keyword = null, status = 'ACTIVE', minPrice = null, maxPrice = null, sort = 'createdAt,desc', seller = null }) {
      commit('SET_LOADING', true)
      
      try {
        // URL 구성 - 항상 /api/products 사용
        let apiUrl = '/api/products';
        
        // status가 항상 ACTIVE로 들어가도록 보장
        status = status || 'ACTIVE';
        const url = `${apiUrl}?page=${page}&size=${size}` + 
                  (category ? `&category=${category}` : '') +
                  (keyword ? `&keyword=${encodeURIComponent(keyword)}` : '') +
                  (status ? `&status=${status}` : '') +
                  (minPrice ? `&minPrice=${minPrice}` : '') +
                  (maxPrice ? `&maxPrice=${maxPrice}` : '') +
                  (sort ? `&sort=${sort}` : '') +
                  (seller ? `&sellerName=${encodeURIComponent(seller)}` : '')
        
        console.log('API 요청 URL:', url)
        
        // 헤더 설정
        const headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
        
        if (rootState.auth.token) {
          headers['Authorization'] = `Bearer ${rootState.auth.token}`
        }
        
        console.log('API 요청 헤더:', headers)
        
        // 요청 보내기 - credentials 포함
        const response = await fetch(url, { 
          method: 'GET',
          headers,
          credentials: 'include'
        })
        
        console.log('API 응답 상태:', response.status, response.statusText)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('API 오류 응답:', errorText)
          throw new Error(`상품 목록을 불러오는데 실패했습니다. 상태 코드: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('API 응답 데이터:', data)
        
        // 상태 업데이트
        if (data && data.data) {
          console.log('API 응답 데이터 구조:', JSON.stringify(data.data, null, 2).substring(0, 400) + '...');
          
          let products = data.data.content || [];
          console.log('API에서 받아온 상품 데이터 샘플:', products.length > 0 ? JSON.stringify(products[0], null, 2) : 'No products');
          
          // 스웨거 명세에 맞게 변환 및 통계 데이터 추출
          products = products.map(item => {
            // API 응답 구조에 따른 처리
            // 대부분의 API는 상품 정보와 함께 stats를 별도로 포함하지 않을 수 있으므로
            // 상품 자체에 viewCount, wishlistCount, isWishlisted 필드가 있다고 가정
            const product = {
              id: item.id,
              name: item.name,
              price: item.price,
              description: item.description,
              category: item.category,
              status: item.status,
              thumbnailUrl: item.thumbnailUrl,
              imageUrls: item.imageUrls || [],
              sellerName: item.sellerName,
              sellerId: item.sellerId,
              createdDate: item.createdDate || item.createdAt,
              updatedDate: item.updatedDate || item.updatedAt
            };
            
            // 통계 데이터 추출
            const stats = {
              viewCount: item.viewCount || 0,
              wishlistCount: item.wishlistCount || 0,
              isWishlisted: item.isWishlisted || false
            };
            
            return { product, stats };
          });
          const pageInfo = data.data.page || {};
          commit('SET_PRODUCTS', {
            products: products,
            totalPages: pageInfo.totalPages || 0,
            totalElements: pageInfo.totalElements || 0
          });
          commit('SET_LOADING', false);
          return {
            content: products,
            totalPages: pageInfo.totalPages || 0,
            totalElements: pageInfo.totalElements || 0
          };
        } else {
          throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        console.error('상품 목록 조회 오류:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        
        // 기본 값 반환하여 UI가 깨지지 않도록 함
        return {
          content: [],
          totalPages: 0,
          totalElements: 0
        }
      }
    },
    
    async fetchProduct({ commit, rootState, state }, productId) {
      commit('SET_LOADING', true)
      console.log('상품 로드 시작:', productId);
      console.log('조회수 증가 스킵 여부:', state.skipViewIncrement);
      
      try {
        let url = `/api/products/${productId}`;
        if (state.skipViewIncrement) {
          url += '?skipViewIncrement=true';
        }
        const response = await fetch(url, {
          headers: rootState.auth.token ? { 'Authorization': `Bearer ${rootState.auth.token}` } : {},
          credentials: 'include'
        });
        
        console.log('API 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`상품 정보를 불러오는데 실패했습니다. 상태 코드: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('상품 상세 응답 데이터:', JSON.stringify(data).substring(0, 200) + '...');
        
        // 상태 업데이트
        if (data && data.data) {
          let detail = data.data;
          
          // 상세도 { product, stats } 구조로 변환
          if (!detail.product) {
            detail = { 
              product: detail, 
              stats: {
                viewCount: detail.viewCount || 0,
                wishlistCount: detail.wishlistCount || 0,
                isWishlisted: detail.isWishlisted || false
              }
            };
          }
          
          // 위시리스트 상태 확인 - state.wishlist에서 해당 상품이 있는지 확인
          const isProductInWishlist = state.wishlist.some(item => 
            (item.id === productId) || 
            (item.product && item.product.id === productId)
          );
          
          // 위시리스트에 있다면 isWishlisted를 true로 설정
          if (isProductInWishlist) {
            console.log('상품이 위시리스트에 있음, isWishlisted를 true로 설정');
            detail.stats.isWishlisted = true;
          }
          
          commit('SET_PRODUCT', detail);
          console.log('상품 상세 데이터 저장 완료:', detail);
          
          if (state.skipViewIncrement) {
            console.log('조회수 증가 건너뜀 (프로필 또는 위시리스트 페이지)');
          } else {
            console.log('조회수 증가 처리 완료 (상품 상세 페이지)');
          }
        } else {
          throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
        
        commit('SET_LOADING', false);
        return data.data;
      } catch (error) {
        console.error('상품 상세 조회 오류:', error);
        commit('SET_ERROR', error.message);
        commit('SET_LOADING', false);
        throw error;
      }
    },
    
    async createProduct({ commit, rootState }, { productData, images }) {
      commit('SET_LOADING', true)
      
      try {
        console.log('상품 등록 요청 데이터:', productData);
        console.log('상품 이미지:', images);
        
        const formData = new FormData();
        
        // JSON 데이터를 FormData에 추가
        const requestBlob = new Blob([JSON.stringify(productData)], {
          type: 'application/json'
        });
        formData.append('request', requestBlob);
        
        // 이미지 파일 추가
        if (images && images.length > 0) {
          for (const image of images) {
            formData.append('images', image);
            console.log('이미지 추가:', image.name, image.type, image.size);
          }
        }
        
        // 토큰 확인
        if (!rootState.auth.token) {
          throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
        }
        
        console.log('인증 토큰:', rootState.auth.token.substring(0, 10) + '...');
        
        const response = await fetch(`/api/products`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${rootState.auth.token}`
            // FormData 사용 시 Content-Type은 자동으로 설정됨
          },
          body: formData,
          credentials: 'include'
        });
        
        console.log('상품 등록 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
          // 응답 본문 확인
          let errorMessage;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || '상품 등록에 실패했습니다.';
            console.error('상품 등록 오류 응답:', errorData);
          } catch (e) {
            errorMessage = `상품 등록에 실패했습니다. 상태 코드: ${response.status}`;
            console.error('상품 등록 오류: 응답 본문을 파싱할 수 없음');
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('상품 등록 성공 응답:', data);
        
        let created = data.data;
        if (!created.product) {
          created = { product: created, stats: {} };
        }
        commit('SET_LOADING', false);
        return created;
      } catch (error) {
        console.error('상품 등록 오류:', error);
        commit('SET_ERROR', error.message);
        commit('SET_LOADING', false);
        throw error;
      }
    },
    
    async toggleWishlist({ commit, rootState }, productId) {
      try {
        if (!rootState.auth.token) {
          throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
        }

        const response = await fetch(`/api/products/${productId}/wishlist`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${rootState.auth.token}`,
            'Accept': 'application/json'
          },
          credentials: 'include' // 쿠키와 인증 정보 포함
        });
        
        if (!response.ok) {
          throw new Error('관심 상품 처리에 실패했습니다.');
        }
        
        const data = await response.json();
        console.log('위시리스트 토글 응답:', data);
        
        // 백엔드에서 반환된 정보로 위시리스트 상태 업데이트
        // 이 때, data 객체에는 added(boolean)와 count(number) 필드가 있어야 함
        commit('TOGGLE_WISHLIST_STATUS', { 
          productId, 
          isWishlisted: data.added, 
          wishlistCount: data.count 
        });
        
        return {
          isWishlisted: data.added,
          count: data.count
        };
      } catch (error) {
        console.error('관심 상품 처리 오류:', error);
        throw error;
      }
    },
    
    async fetchWishlist({ commit, rootState }) {
      try {
        // 토큰이 없으면 빈 배열 반환
        if (!rootState.auth.token) {
          console.warn('인증 토큰이 없어 관심 상품 목록을 불러올 수 없습니다. 로그인이 필요합니다.');
          commit('SET_WISHLIST', []);
          return [];
        }
        
        console.log('관심 상품 목록 가져오기 요청 시작...');
        
        // Authorization 헤더에 Bearer 토큰 추가
        const response = await fetch(`/api/products/wishlist`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${rootState.auth.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          // 401 오류인 경우 토큰이 만료되었을 수 있음
          if (response.status === 401) {
            console.warn('인증이 만료되었습니다. 다시 로그인해주세요.');
          }
          
          throw new Error('관심 상품 목록을 불러오는데 실패했습니다. 상태 코드: ' + response.status);
        }
        
        const data = await response.json();
        console.log('관심 상품 목록 응답:', data);
        
        if (data && data.data) {
          // 데이터가 있는 경우 위시리스트 업데이트
          const wishlistItems = Array.isArray(data.data) ? data.data : [];
          
          // 각 상품에 필요한 필드 포함되었는지 확인하고 필요시 형식 맞추기
          const formattedWishlist = wishlistItems.map(item => {
            // 상품 정보가 product 필드 안에 들어있지 않으면 형식 맞추기
            if (!item.product) {
              return {
                product: {
                  id: item.productId || item.id,
                  name: item.name,
                  price: item.price,
                  description: item.description,
                  category: item.category,
                  status: item.status,
                  thumbnailUrl: item.thumbnailUrl || item.imageUrls?.[0],
                  imageUrls: item.imageUrls || [item.thumbnailUrl],
                  sellerName: item.sellerName,
                  sellerId: item.sellerId,
                  createdDate: item.createdDate
                },
                stats: {
                  // API 응답에서 직접 통계 정보 사용, 없으면 기본값 설정
                  viewCount: item.viewCount || 0,
                  wishlistCount: item.wishlistCount || 0,
                  isWishlisted: true
                }
              };
            }
            
            // 이미 올바른 형식이면 stats 필드 확인하여 기본값 설정
            return {
              ...item,
              stats: {
                // API 응답에서 직접 통계 정보 사용, 없으면 기본값 설정
                viewCount: item.stats?.viewCount || item.viewCount || 0,
                wishlistCount: item.stats?.wishlistCount || item.wishlistCount || 0,
                isWishlisted: true
              }
            };
          });
          
          console.log('처리된 관심 상품 목록:', formattedWishlist);
          commit('SET_WISHLIST', formattedWishlist);
          return formattedWishlist;
        } else {
          console.warn('관심 상품 API 응답 형식이 올바르지 않습니다:', data);
          commit('SET_WISHLIST', []);
          return [];
        }
      } catch (error) {
        console.error('관심 상품 목록 조회 오류:', error);
        // 오류가 발생해도 UI가 깨지지 않도록 빈 목록으로 설정
        commit('SET_WISHLIST', []);
        throw error;
      }
    },
    
    // 상품 수정 액션 추가
    async updateProduct({ commit, rootState }, { productId, productData, images, deleteImageIds }) {
      commit('SET_LOADING', true)
      
      try {
        console.log('상품 수정 요청 데이터:', productData);
        console.log('상품 이미지:', images);
        console.log('삭제할 이미지 ID:', deleteImageIds);
        
        const formData = new FormData();
        
        // JSON 데이터를 FormData에 추가
        const requestBlob = new Blob([JSON.stringify(productData)], {
          type: 'application/json'
        });
        formData.append('request', requestBlob);
        
        // 새로운 이미지 파일 추가
        if (images && images.length > 0) {
          for (const image of images) {
            // 새로운 파일만 추가 (File 객체인 경우)
            if (image instanceof File) {
              formData.append('newImages', image);
              console.log('새 이미지 추가:', image.name, image.type, image.size);
            }
          }
        }
        
        // 삭제할 이미지 ID들을 쿼리 파라미터로 추가
        let url = `/api/products/${productId}`;
        if (deleteImageIds && Array.isArray(deleteImageIds) && deleteImageIds.length > 0) {
          const params = new URLSearchParams();
          deleteImageIds.forEach(id => {
            if (id !== null && id !== undefined) {
              params.append('deleteImageIds', String(id));
            }
          });
          const paramString = params.toString();
          if (paramString) {
            url += '?' + paramString;
          }
        }
        
        // 토큰 확인
        if (!rootState.auth.token) {
          throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
        }
        
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${rootState.auth.token}`
            // FormData 사용 시 Content-Type은 자동으로 설정됨
          },
          body: formData,
          credentials: 'include'
        });
        
        if (!response.ok) {
          let errorMessage;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || '상품 수정에 실패했습니다.';
            console.error('상품 수정 오류 응답:', errorData);
          } catch (e) {
            errorMessage = `상품 수정에 실패했습니다. 상태 코드: ${response.status}`;
            console.error('상품 수정 오류: 응답 본문을 파싱할 수 없음');
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('상품 수정 성공 응답:', data);
        
        let updated = data.data;
        if (!updated.product) {
          updated = { product: updated, stats: {} };
        }
        // 성공 시 해당 상품 정보 업데이트
        commit('SET_PRODUCT', updated);
        commit('SET_LOADING', false);
        return updated;
      } catch (error) {
        console.error('상품 수정 오류:', error);
        commit('SET_ERROR', error.message);
        commit('SET_LOADING', false);
        throw error;
      }
    },
    
    // 상품 삭제 액션 추가
    async deleteProduct({ commit, rootState }, productId) {
      commit('SET_LOADING', true)
      
      try {
        // 토큰 확인
        if (!rootState.auth.token) {
          throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
        }
        
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${rootState.auth.token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          let errorMessage;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || '상품 삭제에 실패했습니다.';
            console.error('상품 삭제 오류 응답:', errorData);
          } catch (e) {
            errorMessage = `상품 삭제에 실패했습니다. 상태 코드: ${response.status}`;
            console.error('상품 삭제 오류: 응답 본문을 파싱할 수 없음');
          }
          throw new Error(errorMessage);
        }
        
        // 성공 시 상태 업데이트
        commit('SET_LOADING', false);
        return true;
      } catch (error) {
        console.error('상품 삭제 오류:', error);
        commit('SET_ERROR', error.message);
        commit('SET_LOADING', false);
        throw error;
      }
    }
  },
  
  getters: {
    getProductById: (state) => (id) => {
      if (state.product && state.product.id === id) {
        return state.product
      }
      
      const productDetail = state.products.find(p => p.product.id === id)
      return productDetail ? productDetail : null
    },
    
    isWishlisted: (state) => (id) => {
      // 위시리스트에서 id 또는 product.id가 일치하는 항목 찾기
      return state.wishlist.some(item => 
        (item.id === id) || 
        (item.product && item.product.id === id)
      );
    }
  }
}
