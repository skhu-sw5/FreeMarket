import axios from 'axios'

const state = {
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken')
}

const getters = {
  isAuthenticated: state => state.isAuthenticated,
  user: state => state.user
}

const actions = {
  // 로그인 액션
  async login({ commit }, credentials) {
    try {
      const response = await axios.post('/api/auth/login', credentials)
      const { accessToken, refreshToken } = response.data.data
      
      // 토큰 저장 및 인증 상태 업데이트
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      commit('setAuthTokens', { accessToken, refreshToken })
      
      return Promise.resolve(response)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  
  // 로그아웃 액션
  async logout({ commit }) {
    try {
      // 서버에 로그아웃 요청 (리프레시 토큰 무효화)
      await axios.post('/api/auth/logout')
      
      // 로컬 스토리지 및 상태 정리
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      commit('clearAuth')
      
      return Promise.resolve()
    } catch (error) {
      // 서버 요청이 실패해도 로컬에서는 로그아웃 처리
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      commit('clearAuth')
      
      return Promise.reject(error)
    }
  },
  
  // 사용자 프로필 정보 가져오기
  async fetchUserProfile({ commit }) {
    try {
      const response = await axios.get('/api/users/me')
      commit('setUser', response.data.data)
      return Promise.resolve(response)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  
  // 소셜 로그인 시작
  socialLogin(_, provider) {
    import('@/utils/environment').then(env => {
      // 현재 환경에 맞는 OAuth2 URL 생성
      const oauth2Url = env.getOAuth2Url(provider);
      
      // 소셜 로그인 페이지로 리다이렉트
      window.location.href = oauth2Url;
    });
  },
  
  // 토큰 갱신
  async refreshTokens({ commit, state }) {
    try {
      const response = await axios.post('/api/auth/refresh', {
        refreshToken: state.refreshToken
      })
      
      const { accessToken, refreshToken } = response.data.data
      
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      commit('setAuthTokens', { accessToken, refreshToken })
      
      return Promise.resolve(response)
    } catch (error) {
      // 토큰 갱신에 실패하면 로그아웃 처리
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      commit('clearAuth')
      
      return Promise.reject(error)
    }
  }
}

const mutations = {
  setAuthTokens(state, { accessToken, refreshToken }) {
    state.accessToken = accessToken
    state.refreshToken = refreshToken
    state.isAuthenticated = true
  },
  
  setUser(state, user) {
    state.user = user
  },
  
  clearAuth(state) {
    state.accessToken = null
    state.refreshToken = null
    state.user = null
    state.isAuthenticated = false
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
