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
    wishlist: []
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
    TOGGLE_WISHLIST(state, productId) {
      const index = state.wishlist.findIndex(item => item.id === productId)
      
      if (index !== -1) {
        state.wishlist.splice(index, 1)
      } else if (state.product && state.product.id === productId) {
        state.wishlist.push(state.product)
      }
      
      // 현재 상품 상세 페이지의 위시리스트 상태도 업데이트
      if (state.product && state.product.id === productId) {
        state.product.stats.isWishlisted = !state.product.stats.isWishlisted
      }
      
      // 상품 목록의 위시리스트 상태도 업데이트
      const productIndex = state.products.findIndex(p => p.product.id === productId)
      if (productIndex !== -1) {
        state.products[productIndex].stats.isWishlisted = !state.products[productIndex].stats.isWishlisted
      }
    }
  },
  
  actions: {
    async fetchProducts({ commit, rootState }, { page = 0, size = 12, category = null, keyword = null, status = null, minPrice = null, maxPrice = null, sort = 'createdAt,desc', seller = null }) {
      commit('SET_LOADING', true)
      
      try {
        // URL 구성
let targetUrl = '/api/products';  // 프록시를 통해 요청 처리

        
        if (category) {
          targetUrl += `&category=${category}`
        }
        
        if (keyword) {
          targetUrl += `&keyword=${encodeURIComponent(keyword)}`
        }
        
        if (status) {
          targetUrl += `&status=${status}`
        }
        
        if (minPrice) {
          targetUrl += `&minPrice=${minPrice}`
        }
        
        if (maxPrice) {
          targetUrl += `&maxPrice=${maxPrice}`
        }
        
        if (sort) {
          targetUrl += `&sort=${sort}`
        }
        
        if (seller) {
          targetUrl += `&sellerName=${encodeURIComponent(seller)}`
        }
        
        // CORS 프록시 사용
        const url = `/api/products?page=${page}&size=${size}` + 
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
        
        // 요청 보내기
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
          commit('SET_PRODUCTS', {
            products: data.data.content || [],
            totalPages: data.data.totalPages || 0,
            totalElements: data.data.totalElements || 0
          })
          
          commit('SET_LOADING', false)
          return data.data
        } else {
          throw new Error('API 응답 형식이 올바르지 않습니다.')
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
    
    async fetchProduct({ commit, rootState }, productId) {
      commit('SET_LOADING', true)
      
      try {
        const headers = {}
        if (rootState.auth.token) {
          headers['Authorization'] = `Bearer ${rootState.auth.token}`
        }
        
        const response = await fetch(`/api/products/${productId}`, {
          headers,
          credentials: 'include' // 쿠키와 인증 정보 포함
        })
        
        if (!response.ok) {
          throw new Error('상품 정보를 불러오는데 실패했습니다.')
        }
        
        const data = await response.json()
        commit('SET_PRODUCT', data.data)
        
        commit('SET_LOADING', false)
        return data.data
      } catch (error) {
        console.error('상품 상세 조회 오류:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async createProduct({ commit, rootState }, { productData, images }) {
      commit('SET_LOADING', true)
      
      try {
        const formData = new FormData()
        formData.append('request', JSON.stringify(productData))
        
        if (images && images.length > 0) {
          for (const image of images) {
            formData.append('images', image)
          }
        }
        
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${rootState.auth.token}`,
            // Content-Type은 FormData를 사용할 때는 자동으로 설정되므로 제거
          },
          body: formData,
          credentials: 'include' // 쿠키와 인증 정보 포함
        })
        
        if (!response.ok) {
          throw new Error('상품 등록에 실패했습니다.')
        }
        
        const data = await response.json()
        
        commit('SET_LOADING', false)
        return data.data
      } catch (error) {
        console.error('상품 등록 오류:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async toggleWishlist({ commit, rootState }, productId) {
      try {
        const response = await fetch(`/api/products/${productId}/wishlist`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${rootState.auth.token}`
          },
          credentials: 'include' // 쿠키와 인증 정보 포함
        })
        
        if (!response.ok) {
          throw new Error('관심 상품 처리에 실패했습니다.')
        }
        
        const data = await response.json()
        commit('TOGGLE_WISHLIST', productId)
        
        return data
      } catch (error) {
        console.error('관심 상품 처리 오류:', error)
        throw error
      }
    },
    
    async fetchWishlist({ commit, rootState }) {
      try {
        const response = await fetch('/api/products/wishlist', {
          headers: {
            'Authorization': `Bearer ${rootState.auth.token}`
          },
          credentials: 'include' // 쿠키와 인증 정보 포함
        })
        
        if (!response.ok) {
          throw new Error('관심 상품 목록을 불러오는데 실패했습니다.')
        }
        
        const data = await response.json()
        commit('SET_WISHLIST', data.data)
        
        return data.data
      } catch (error) {
        console.error('관심 상품 목록 조회 오류:', error)
        throw error
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
      return state.wishlist.some(item => item.id === id)
    }
  }
}
