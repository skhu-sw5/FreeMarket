import { API_BASE_URL } from '@/config'

export default {
  namespaced: true,
  
  state: {
    user: null,
    token: (() => {
      try {
        const token = localStorage.getItem('accessToken');
        console.log('localStorage에서 토큰 로드:', token ? '토큰 있음' : '토큰 없음');
        return token;
      } catch (e) {
        console.error('localStorage에서 토큰을 읽는 중 오류:', e);
        return null;
      }
    })(),
    refreshToken: (() => {
      try {
        return localStorage.getItem('refreshToken');
      } catch (e) {
        console.error('localStorage에서 리프레시 토큰을 읽는 중 오류:', e);
        return null;
      }
    })(),
    isAuthenticated: (() => {
      try {
        const isAuth = !!localStorage.getItem('accessToken');
        console.log('인증 상태:', isAuth ? '인증됨' : '인증되지 않음');
        return isAuth;
      } catch (e) {
        console.error('인증 상태 확인 중 오류:', e);
        return false;
      }
    })()
  },
  
  mutations: {
    SET_AUTH_USER(state, user) {
      state.user = user
    },
    SET_AUTH_TOKENS(state, { accessToken, refreshToken }) {
      state.token = accessToken
      state.refreshToken = refreshToken
      state.isAuthenticated = true
      
      try {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        console.log('토큰이 localStorage에 저장되었습니다.');
      } catch (error) {
        console.error('localStorage에 토큰 저장 중 오류:', error);
      }
    },
    CLEAR_AUTH(state) {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
    UPDATE_USER(state, userData) {
      state.user = { ...state.user, ...userData }
    }
  },
  
  actions: {
    async login({ commit, dispatch }, credentials) {
      try {
        console.log('로그인 요청...');
        
        const response = await fetch('/api/auth/login', {
          method: 'POST', // 명시적으로 POST 메서드 지정
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(credentials),
          credentials: 'include'
        })
        
        console.log('로그인 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
          if (response.status === 500) {
            throw new Error('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          }
          
          try {
            const errorData = await response.json();
            throw new Error(errorData.message || '로그인에 실패했습니다.');
          } catch (jsonError) {
            // JSON 파싱 실패 시 일반 오류 메시지 사용
            throw new Error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
          }
        }
        
        const data = await response.json()
        console.log('로그인 응답 데이터:', data);
        
        // 토큰 검증
        if (!data.data || !data.data.accessToken) {
          throw new Error('응답에 액세스 토큰이 없습니다.');
        }
        
        commit('SET_AUTH_TOKENS', {
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken || null
        })
        
        console.log('액세스 토큰이 성공적으로 저장되었습니다:', data.data.accessToken.substring(0, 10) + '...');
        
        // 로그인 후 사용자 정보 가져오기
        try {
          await dispatch('fetchUser')
        } catch (fetchError) {
          console.error('사용자 정보 로딩 실패:', fetchError);
          // fetchUser 실패해도 로그인은 성공한 것으로 처리
        }
        
        return data
      } catch (error) {
        console.error('로그인 오류:', error)
        
        // 네트워크 오류 처리
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
        }
        
        throw error
      }
    },
    
    async register({ commit }, userData) {
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData),
          credentials: 'include'
        })
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '회원가입에 실패했습니다.');
        }
        
        const data = await response.json()
        console.log('회원가입 응답:', data);
        return data
      } catch (error) {
        console.error('회원가입 오류:', error)
        
        // 네트워크 오류 처리
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
        }
        
        throw error
      }
    },
    
    async fetchUser({ commit, state }) {
      if (!state.token) {
        console.log('토큰이 없습니다. 사용자 정보를 가져올 수 없습니다.');
        return null;
      }
      
      // 간단한 토큰 유효성 검사 (형식만)
      if (typeof state.token !== 'string' || state.token.trim() === '') {
        console.error('토큰이 유효하지 않은 형식입니다:', state.token);
        commit('CLEAR_AUTH'); // 잘못된 토큰 제거
        return null;
      }
      
      try {
        console.log('사용자 정보 가져오기 요청 - 토큰:', state.token.substring(0, 10) + '...');
        
        // 네트워크 상태 확인
        if (!navigator.onLine) {
          console.error('오프라인 상태입니다. 네트워크 연결을 확인하세요.');
          throw new Error('네트워크 연결이 없습니다.');
        }
        
        // 전체 URL을 사용해 봅니다
        const apiUrl = window.location.origin + '/api/users/me';
        console.log('API 요청 URL:', apiUrl);
        
        // 사용자 정보 가져오기 요청
        // 문제 해결 팁:
        // 1. 올바른 인증 토큰 사용 확인
        // 2. API 서버 접근 가능 여부 확인
        // 3. CORS 이슈가 의심될 경우 vue.config.js의 프록시 설정 확인
        // 4. 개발자 도구의 Network 탭에서 요청 확인
        const response = await fetch(apiUrl, {
          method: 'GET', // 명시적으로 GET 메서드 지정
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          // 리디렉션 처리 방지
          redirect: 'error',
          // 캐시 비활성화
          cache: 'no-cache'
        })
        
        console.log('사용자 정보 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.error('인증 오류: 토큰이 유효하지 않거나 만료되었습니다');
            commit('CLEAR_AUTH')
            throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
          }
          throw new Error('사용자 정보를 불러오는데 실패했습니다.')
        }
        
        const data = await response.json()
        console.log('사용자 정보 응답 데이터:', data);
        
        if (data && data.data) {
          commit('SET_AUTH_USER', data.data)
          return data.data
        } else {
          console.error('사용자 정보 응답 형식 오류:', data)
          throw new Error('사용자 정보 응답 형식이 올바르지 않습니다.')
        }
      } catch (error) {
        console.error('사용자 정보 조회 오류:', error)
        // 네트워크 오류인 경우 토큰을 유지하고 null 반환
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          console.log('네트워크 연결 오류: API 서버에 연결할 수 없습니다.')
          
          // 개발 환경에서 더 자세한 정보 제공
          if (import.meta.env?.MODE === 'development' || window.location.hostname === 'localhost') {
            console.warn('개발 환경 안내: Spring Boot 백엔드가 실행 중인지 확인하세요(localhost:8080)');
          }
          
          return null;
        }
        
        // 인증 오류인 경우 로그인 페이지로 리다이렉트
        if (error.message.includes('인증이 만료되었습니다')) {
          // 로그인 페이지로 프로그래밍 방식으로 리다이렉트
          window.location.href = '/login';
        }
        
        // 다른 오류의 경우 오류를 전파
        throw error
      }
    },
    
    async updateUser({ commit, state }, userData) {
      if (!state.token) throw new Error('로그인이 필요합니다.')
      
      try {
        const response = await fetch('/api/users/me', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData),
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('사용자 정보 업데이트에 실패했습니다.')
        }
        
        const data = await response.json()
        commit('UPDATE_USER', userData)
        
        return data.data
      } catch (error) {
        console.error('사용자 정보 업데이트 오류:', error)
        throw error
      }
    },
    
    async changePassword({ state }, { currentPassword, newPassword }) {
      if (!state.token) throw new Error('로그인이 필요합니다.')
      
      try {
        const response = await fetch('/api/users/password', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ currentPassword, newPassword }),
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('비밀번호 변경에 실패했습니다.')
        }
        
        const data = await response.json()
        return data
      } catch (error) {
        console.error('비밀번호 변경 오류:', error)
        throw error
      }
    },
    
    logout({ commit }) {
      try {
        console.log('로그아웃 처리 중...');
        // 서버에 로그아웃 요청도 보낼 수 있음
        commit('CLEAR_AUTH')
        console.log('로그아웃 완료, 인증 정보가 제거되었습니다.');
        
        // 로그아웃 후 처리 - 예: 리다이렉트
        return true;
      } catch (error) {
        console.error('로그아웃 오류:', error)
        return false;
      }
    }
  },
  
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    token: state => state.token
  }
}
