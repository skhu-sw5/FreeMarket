// 이메일 인증 관련 Vuex 모듈
export default {
  namespaced: true,
  
  state: {
    loading: false,
    error: null,
    verificationSent: false,
    verificationSuccess: false,
    verificationMessage: ''
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_VERIFICATION_SENT(state, sent) {
      state.verificationSent = sent;
    },
    SET_VERIFICATION_SUCCESS(state, success) {
      state.verificationSuccess = success;
    },
    SET_VERIFICATION_MESSAGE(state, message) {
      state.verificationMessage = message;
    },
    RESET_STATE(state) {
      state.loading = false;
      state.error = null;
      state.verificationSent = false;
      state.verificationSuccess = false;
      state.verificationMessage = '';
    }
  },
  
  actions: {
    // 이메일 인증 코드 요청 액션
    async sendVerificationEmail({ commit, rootState }, email) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        // 인증 상태 확인
        if (!rootState.auth.token) {
          throw new Error('로그인이 필요합니다.');
        }
        
        console.log(`이메일 인증 요청을 보냅니다: ${email}`);
        
        // API 요청 URL 로깅
        const apiUrl = '/api/auth/email-verification/send';
        console.log('API 요청 URL:', apiUrl);
        
        // 요청 데이터 로깅
        const requestBody = { email };
        console.log('요청 데이터:', requestBody);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${rootState.auth.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody),
          credentials: 'include'
        });
        
        console.log('이메일 인증 요청 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
          let errorMessage;
          try {
            const errorData = await response.json();
            console.error('오류 응답 데이터:', errorData);
            errorMessage = errorData.message || `이메일 인증 요청에 실패했습니다. (상태 코드: ${response.status})`;
          } catch (e) {
            // JSON 파싱 실패 시
            errorMessage = `이메일 인증 요청에 실패했습니다. (상태 코드: ${response.status})`;
            console.error('오류 응답을 파싱할 수 없습니다:', e);
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('이메일 인증 요청 응답:', data);
        
        commit('SET_VERIFICATION_SENT', true);
        commit('SET_VERIFICATION_MESSAGE', data.data?.message || '인증 이메일이 발송되었습니다. 이메일함을 확인해주세요.');
        
        // 사용자에게 도움이 될 만한 정보 추가
        console.log('이메일이 전송되었습니다. 다음 사항을 확인해보세요:');
        console.log('1. 스팸/프로모션 폴더를 확인하세요');
        console.log('2. 이메일 주소가 정확한지 확인하세요');
        console.log(`3. 입력한 이메일 주소: ${email}`);
        
        return data;
      } catch (error) {
        console.error('이메일 인증 요청 오류:', error);
        // 오류 메시지를 더 자세히 제공
        const errorMsg = error.message || '이메일 인증 요청에 실패했습니다.';
        const extendedErrorMsg = errorMsg + ' 메일 서버 연결에 문제가 있을 수 있습니다. 잠시 후 다시 시도해주세요.';
        commit('SET_ERROR', extendedErrorMsg);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // 이메일 인증 코드 확인 액션
    async verifyEmail({ commit, dispatch, rootState }, { email, verificationCode }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        // 인증 상태 확인
        if (!rootState.auth.token) {
          throw new Error('로그인이 필요합니다.');
        }
        
        const response = await fetch('/api/auth/email-verification/verify', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${rootState.auth.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email, verificationCode }),
          credentials: 'include'
        });
        
        console.log('이메일 인증 코드 확인 응답 상태:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '이메일 인증에 실패했습니다.');
        }
        
        const data = await response.json();
        console.log('이메일 인증 확인 응답:', data);
        
        commit('SET_VERIFICATION_SUCCESS', true);
        commit('SET_VERIFICATION_MESSAGE', data.data?.message || '이메일 인증이 완료되었습니다.');
        
        // 인증 성공 후 사용자 정보 강제 갱신
        console.log('이메일 인증 성공: 사용자 정보를 갱신합니다.');
        try {
          // auth 모듈의 fetchUser 액션 호출하여 사용자 정보 새로고침
          await dispatch('auth/fetchUser', null, { root: true });
          
          // emailVerified 상태가 반영되었는지 확인
          if (rootState.auth.user && rootState.auth.user.emailVerified) {
            console.log('사용자 정보 갱신 성공: 이메일 인증 상태가 반영되었습니다.');
          } else {
            console.warn('사용자 정보 갱신 후에도 이메일 인증 상태가 반영되지 않았습니다.');
            
            // 사용자 정보에 직접 emailVerified 플래그 설정
            if (rootState.auth.user) {
              commit('auth/UPDATE_USER', { emailVerified: true }, { root: true });
              console.log('사용자 정보를 수동으로 업데이트했습니다: emailVerified = true');
            }
          }
        } catch (updateError) {
          console.error('인증 후 사용자 정보 갱신 중 오류:', updateError);
          // 사용자 정보 갱신 실패해도 인증 자체는 성공으로 처리
        }
        
        return { ...data, verificationSuccess: true };
      } catch (error) {
        console.error('이메일 인증 코드 확인 오류:', error);
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // 상태 초기화 액션
    resetState({ commit }) {
      commit('RESET_STATE');
    }
  },
  
  getters: {
    isLoading: state => state.loading,
    getError: state => state.error,
    isVerificationSent: state => state.verificationSent,
    isVerificationSuccess: state => state.verificationSuccess,
    getVerificationMessage: state => state.verificationMessage
  }
};
