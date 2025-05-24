import { API_BASE_URL } from '@/config'
import { apiGet, apiPost, apiPatch } from '@/utils/api'
import { 
  isTokenExpired, 
  getTokenFromStorage, 
  setTokenToStorage, 
  removeTokenFromStorage 
} from '@/utils/auth'

export default {
  namespaced: true,
  
  state: {
    user: null,
    token: getTokenFromStorage('accessToken'),
    refreshToken: getTokenFromStorage('refreshToken'),
    // 초기화 시에는 false로 시작하고, 토큰 검증 완료 후에만 true로 설정
    isAuthenticated: false,
    isInitialized: false, // 초기화 완료 여부 추가
    isRefreshing: false, // 토큰 리프레시 중인지 상태 추가
    refreshPromise: null // 리프레시 중인 Promise 객체 저장
  },
  
  mutations: {
    SET_AUTH_USER(state, user) {
      state.user = user
      // 사용자 정보가 있으면 인증 상태를 true로 설정
      if (user) {
        state.isAuthenticated = true
      }
    },
    SET_AUTH_TOKENS(state, { accessToken, refreshToken, rememberMe = false }) {
      state.token = accessToken
      state.refreshToken = refreshToken
      // 토큰이 검증되기 전까지는 인증 상태를 true로 설정하지 않음
      
      // Storage에 토큰 저장
      setTokenToStorage('accessToken', accessToken, rememberMe);
      setTokenToStorage('refreshToken', refreshToken, rememberMe);
      
      console.log(`토큰이 ${rememberMe ? 'localStorage' : 'sessionStorage'}에 저장되었습니다`);
    },
    SET_AUTHENTICATED(state, isAuthenticated) {
      state.isAuthenticated = isAuthenticated
    },
    SET_INITIALIZED(state, isInitialized) {
      state.isInitialized = isInitialized
    },
    CLEAR_AUTH(state) {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.isInitialized = true // 로그아웃 시에는 초기화 완료로 설정
      
      // 모든 storage에서 토큰 제거
      removeTokenFromStorage('accessToken');
      removeTokenFromStorage('refreshToken');
    },
    UPDATE_USER(state, userData) {
      state.user = { ...state.user, ...userData }
    },
    SET_REFRESHING(state, isRefreshing) {
      state.isRefreshing = isRefreshing
      if (!isRefreshing) {
        state.refreshPromise = null // 리프레시가 끝나면 Promise 초기화
      }
    },
    SET_REFRESH_PROMISE(state, promise) {
      state.refreshPromise = promise
    }
  },
  
  actions: {
    async login({ commit, dispatch }, credentials) {
      try {
        console.log('로그인 요청...');
        
        // rememberMe 옵션 추출
        const { rememberMe = false, ...loginCredentials } = credentials;
        console.log('자동 로그인 옵션:', rememberMe ? '활성화' : '비활성화');
        
        // 로그인 요청 (인증 헤더 없이, 토큰 갱신도 하지 않음)
        const data = await apiPost('/api/auth/login', loginCredentials, { 
          retry: false,
          skipAuth: true // 인증 헤더를 추가하지 않음
        });
        console.log('로그인 응답 데이터:', data);
        
        // 토큰 검증
        if (!data.data || !data.data.accessToken) {
          throw new Error('응답에 액세스 토큰이 없습니다.');
        }
        
        commit('SET_AUTH_TOKENS', {
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken || null,
          rememberMe: rememberMe
        });
        
        console.log('액세스 토큰이 성공적으로 저장되었습니다:', data.data.accessToken.substring(0, 10) + '...');
        
        // 로그인 후 사용자 정보 가져오기 (인증 상태는 fetchUser에서 설정)
        try {
          await dispatch('fetchUser');
        } catch (fetchError) {
          console.error('사용자 정보 로딩 실패:', fetchError);
          // fetchUser 실패 시 토큰 정리
          commit('CLEAR_AUTH');
          throw fetchError;
        }
        
        return data;
      } catch (error) {
        console.error('로그인 오류:', error);
        throw error;
      }
    },
    
    async register({ commit }, userData) {
      try {
        const data = await apiPost('/api/auth/signup', userData, { 
          retry: false,
          skipAuth: true // 인증 헤더를 추가하지 않음
        });
        console.log('회원가입 응답:', data);
        return data;
      } catch (error) {
        console.error('회원가입 오류:', error);
        throw error;
      }
    },

    // 토큰 리프레시 함수
    async refreshTokenAction({ commit, state }) {
      // 이미 진행 중인 리프레시가 있으면 그 Promise 반환
      if (state.isRefreshing && state.refreshPromise) {
        console.log('이미 진행 중인 토큰 리프레시가 있습니다. 기존 요청을 재사용합니다.');
        return state.refreshPromise;
      }

      // 리프레시 토큰이 없으면 오류
      if (!state.refreshToken) {
        console.error('리프레시 토큰이 없습니다. 로그아웃됩니다.');
        commit('CLEAR_AUTH');
        return Promise.reject(new Error('리프레시 토큰이 없습니다.'));
      }

      // 리프레시 상태 설정
      commit('SET_REFRESHING', true);

      // 일반 Promise 사용하여 ESLint 오류 해결
      const refreshPromise = new Promise((resolve, reject) => {
        // apiPost 사용 (자체적으로 리프레시 처리하지 않도록 설정)
        apiPost('/api/auth/refresh', { refreshToken: state.refreshToken }, { 
          retry: false,
          skipAuth: true // 인증 헤더를 추가하지 않음 
        })
          .then(data => {
            console.log('토큰 리프레시 요청 성공');
            
            // 새 토큰 검증
            if (!data.data || !data.data.accessToken || !data.data.refreshToken) {
              throw new Error('응답에 필요한 토큰 정보가 없습니다.');
            }

            // 새 토큰 저장 (기존 rememberMe 설정 유지)
            const rememberMe = localStorage.getItem('accessToken') !== null;
            commit('SET_AUTH_TOKENS', {
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
              rememberMe: rememberMe
            });

            console.log('토큰 리프레시 성공:', data.data.accessToken.substring(0, 10) + '...');
            resolve(data.data.accessToken);
          })
          .catch(error => {
            console.error('토큰 리프레시 오류:', error);
            
            // 401 또는 다른 인증 오류면 로그아웃
            if (error.message.includes('인증이 만료되었습니다') || 
                error.message.includes('401') || 
                error.message.includes('권한이 없습니다')) {
              commit('CLEAR_AUTH');
            }
            
            reject(error);
          })
          .finally(() => {
            commit('SET_REFRESHING', false);
          });
      });

      // 리프레시 Promise 저장
      commit('SET_REFRESH_PROMISE', refreshPromise);
      return refreshPromise;
    },
    
    async fetchUser({ commit, state, dispatch }) {
      if (!state.token) {
        console.log('토큰이 없습니다. 사용자 정보를 가져올 수 없습니다.');
        commit('SET_AUTHENTICATED', false);
        commit('SET_INITIALIZED', true);
        return null;
      }
      
      // 간단한 토큰 유효성 검사 (형식만)
      if (typeof state.token !== 'string' || state.token.trim() === '') {
        console.error('토큰이 유효하지 않은 형식입니다:', state.token);
        commit('CLEAR_AUTH'); // 잘못된 토큰 제거
        return null;
      }
      
      try {
        console.log('사용자 정보 가져오기 요청 시작');
        
        // 네트워크 상태 확인
        if (!navigator.onLine) {
          console.error('오프라인 상태입니다. 네트워크 연결을 확인하세요.');
          throw new Error('네트워크 연결이 없습니다.');
        }
        
        // 캐시를 무효화하기 위한 타임스탬프 파라미터
        const timestamp = new Date().getTime();
        const url = `/api/users/me?_t=${timestamp}`;
        
        // 캐시 관련 옵션 추가
        const options = {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          cache: 'no-cache'
        };
        
        // apiGet은 자동으로 토큰을 헤더에 추가하고, 토큰 만료 시 갱신 시도
        const data = await apiGet(url, options);
        console.log('사용자 정보 응답 데이터:', data);
        
        if (data && data.data) {
          // 디버깅 정보 출력
          console.log('사용자 API 응답 원본 데이터:', data.data);
          
          // emailVerified 필드가 있으면 정확하게 boolean으로 변환
          if ('emailVerified' in data.data) {
            console.log('이메일 인증 상태 원본 값:', data.data.emailVerified, '타입:', typeof data.data.emailVerified);
            
            // 명시적으로 false 값으로 처리되어야 하는 경우 확인
            if (data.data.emailVerified === false || 
                data.data.emailVerified === "false" || 
                data.data.emailVerified === 0 || 
                data.data.emailVerified === "0") {
              data.data.emailVerified = false;
            } else {
              data.data.emailVerified = true;
            }
            
            console.log('변환된 이메일 인증 상태:', data.data.emailVerified);
          } else {
            console.warn('사용자 데이터에 emailVerified 필드가 없습니다!');
            // 필드가 없으면 기본값을 false로 설정
            data.data.emailVerified = false;
          }
          
          // 기존 사용자 데이터를 보존하면서 새 데이터로 업데이트
          const updatedUser = state.user ? { ...state.user, ...data.data } : data.data;
          commit('SET_AUTH_USER', updatedUser);
          commit('SET_INITIALIZED', true);
          
          console.log('최종 사용자 정보:', updatedUser);
          return updatedUser;
        } else {
          console.error('사용자 정보 응답 형식 오류:', data)
          throw new Error('사용자 정보 응답 형식이 올바르지 않습니다.')
        }
      } catch (error) {
        console.error('사용자 정보 조회 오류:', error)
        
        // 인증 관련 오류인 경우 로그아웃 처리
        if (error.message && (error.message.includes('인증이 만료되었습니다') || 
                              error.message.includes('401') || 
                              error.message.includes('권한이 없습니다'))) {
          console.log('인증 오류로 인해 로그아웃 처리합니다.');
          commit('CLEAR_AUTH');
          return null;
        }
        
        // 네트워크 오류인 경우 초기화만 완료하고 인증 상태 유지
        if (error.message && error.message.includes('서버에 연결할 수 없습니다')) {
          commit('SET_INITIALIZED', true);
          return null;
        }
        
        // 다른 오류의 경우 인증 상태 초기화
        commit('CLEAR_AUTH');
        throw error;
      }
    },
    
    // 토큰 유효성 검증 액션 (앱 초기화 시 사용)
    async validateToken({ commit, state, dispatch }) {
      console.log('토큰 유효성 검증 시작');
      
      if (!state.token) {
        console.log('토큰이 없습니다.');
        commit('SET_AUTHENTICATED', false);
        commit('SET_INITIALIZED', true);
        return false;
      }
      
      // 토큰 만료 시간 확인
      if (isTokenExpired(state.token)) {
        console.log('액세스 토큰이 만료되었습니다. 리프레시 토큰으로 갱신을 시도합니다.');
        
        // 리프레시 토큰이 있으면 갱신 시도
        if (state.refreshToken && !isTokenExpired(state.refreshToken)) {
          try {
            await dispatch('refreshTokenAction');
            console.log('토큰 갱신 성공');
            // 갱신 후 사용자 정보 가져오기
            const user = await dispatch('fetchUser');
            return !!user;
          } catch (error) {
            console.error('토큰 갱신 실패:', error);
            commit('CLEAR_AUTH');
            return false;
          }
        } else {
          console.log('리프레시 토큰이 없거나 만료되었습니다.');
          commit('CLEAR_AUTH');
          return false;
        }
      }
      
      try {
        // 사용자 정보 가져오기로 토큰 유효성 확인
        const user = await dispatch('fetchUser');
        
        if (user) {
          console.log('토큰 검증 성공 - 사용자:', user.name);
          return true;
        } else {
          console.log('토큰 검증 실패 - 사용자 정보 없음');
          return false;
        }
      } catch (error) {
        console.error('토큰 검증 오류:', error);
        
        // 리프레시 토큰으로 재시도
        if (state.refreshToken && !isTokenExpired(state.refreshToken)) {
          try {
            console.log('리프레시 토큰으로 재시도');
            await dispatch('refreshTokenAction');
            const user = await dispatch('fetchUser');
            
            if (user) {
              console.log('리프레시 후 토큰 검증 성공');
              return true;
            }
          } catch (refreshError) {
            console.error('리프레시 토큰으로 재시도 실패:', refreshError);
          }
        }
        
        // 모든 시도 실패 시 로그아웃
        commit('CLEAR_AUTH');
        return false;
      }
    },
    
    // 사용자 정보 업데이트
    async updateUser({ commit, state }, userData) {
      if (!state.token) throw new Error('로그인이 필요합니다.')
      
      try {
        const data = await apiPatch('/api/users/me', userData);
        
        // 백엔드에서 받은 응답 데이터가 있으면 그것을 사용하고, 없으면 요청 데이터 사용
        const updatedData = data.data || userData;
        commit('UPDATE_USER', updatedData);
        
        return data.data;
      } catch (error) {
        console.error('사용자 정보 업데이트 오류:', error);
        throw error;
      }
    },
    
    async changePassword({ state }, { currentPassword, newPassword }) {
      if (!state.token) throw new Error('로그인이 필요합니다.')
      
      try {
        const data = await apiPost('/api/users/me/password', { currentPassword, newPassword });
        return data;
      } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        throw error;
      }
    },
    
    // 소셜 로그인을 위한 토큰 설정 액션
    setAuth({ commit, dispatch }, { accessToken, refreshToken }) {
      try {
        console.log('소셜 로그인 토큰 설정 중...');
        
        // 토큰 상태 저장
        commit('SET_AUTH_TOKENS', { accessToken, refreshToken });
        
        // 사용자 정보 가져오기
        dispatch('fetchUser');
        
        return true;
      } catch (error) {
        console.error('소셜 로그인 토큰 설정 오류:', error);
        return false;
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
    isInitialized: state => state.isInitialized,
    currentUser: state => state.user,
    token: state => state.token
  }
}
