<template>
  <div class="bg-white p-6 rounded-lg shadow-sm">
    <h2 class="text-xl font-bold mb-4">학교 이메일 인증</h2>
    
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- 인증 완료 상태가 아닐 때만 메시지 표시 -->
    <div v-if="message && !verificationSuccess" class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
      {{ message }}
    </div>
    
    <!-- 이메일 인증이 완료되지 않은 경우 -->
    <div v-if="!verificationSuccess">
      <!-- 인증 코드 발송/입력 폼을 하나의 div에서 조건 분기 -->
      <div v-if="!verificationSent" class="space-y-4">
        <div>
          <p class="mb-4 text-gray-600">
            상품을 등록하시려면 학교 이메일 인증이 필요합니다. 
            아래에 학교 이메일 주소를 입력하시면 인증 코드가 발송됩니다.
          </p>
          
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이메일 주소</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              class="input"
              placeholder="이메일 주소를 입력하세요"
              required
            />
          </div>
          
          <div class="flex space-x-4">
            <button
              @click="sendVerificationEmail"
              :disabled="loading || !isEmailValid"
              class="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="loading">처리 중...</span>
              <span v-else>인증 메일 발송</span>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="space-y-4">
        <div>
          <p class="mb-4 text-gray-600">
            입력하신 이메일 주소로 인증 코드가 발송되었습니다.
            메일함을 확인하고 아래에 수신한 6자리 인증 코드를 입력해주세요.
          </p>
          
          <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p class="font-medium">이메일이 도착하지 않나요?</p>
            <ul class="text-sm list-disc ml-5 mt-2">
              <li>스팸함 또는 프로모션 탭을 확인해보세요.</li>
              <li>입력한 이메일 주소가 정확한지 확인하세요: <strong>{{ email }}</strong></li>
              <li>이메일 서버 문제로 지연될 수 있습니다. 최대 5분 정도 기다려보세요.</li>
              <li>계속 이메일이 오지 않는다면 '다시 시도' 버튼을 눌러 재요청하세요.</li>
            </ul>
          </div>
          
          <div class="mb-4">
            <label for="verificationCode" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">인증 코드</label>
            <input 
              type="text" 
              id="verificationCode" 
              v-model="verificationCode" 
              class="input"
              placeholder="인증 코드를 입력하세요"
              required
            />
          </div>
        </div>
        
        <div class="flex space-x-4">
          <button
            @click="verifyEmail"
            :disabled="loading || !isCodeValid"
            class="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <span v-if="loading">처리 중...</span>
            <span v-else>인증 확인</span>
          </button>
          
          <button
            @click="resetVerification"
            :disabled="loading"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
    
    <!-- 이메일 인증 완료 상태 -->
    <div v-else class="space-y-4">
      <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
        <p class="font-medium text-lg">이메일 인증이 완료되었습니다!</p>
        <p class="text-sm mt-1">이제 상품을 등록하실 수 있습니다.</p>
      </div>
      
      <div class="flex space-x-4">
        <button
          @click="goToSellPage"
          class="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
        >
          상품 등록하기
        </button>
        
        <button
          @click="goToProfile"
          class="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
        >
          프로필로 돌아가기
        </button>
        
        <button
          @click="resetVerification"
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition-colors"
        >
          다시 인증하기
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'EmailVerification',
  
  data() {
    return {
      email: '',
      verificationCode: ''
    };
  },
  
  computed: {
    ...mapState('emailVerification', [
      'loading',
      'error',
      'verificationSent',
      'verificationSuccess',
      'verificationMessage'
    ]),
    
    ...mapState('auth', ['user']),
    
    message() {
      return this.verificationMessage;
    },
    
    isEmailValid() {
      // 간단한 이메일 유효성 검사
      const regex = /^[a-zA-Z0-9._%+-]+@office\.skhu\.ac\.kr$/;
      return regex.test(this.email);
    },
    
    isCodeValid() {
      // 인증 코드 유효성 검사 (6자리 숫자)
      const regex = /^\d{6}$/;
      return regex.test(this.verificationCode);
    }
  },
  
  created() {
    // 컴포넌트 생성 시 사용자 이메일로 초기화
    if (this.user && this.user.email) {
      this.email = this.user.email;
    }
  },
  
  methods: {
    ...mapActions('emailVerification', [
      'sendVerificationEmail',
      'verifyEmail',
      'resetState'
    ]),
    
    async sendVerificationEmail() {
      try {
        await this.$store.dispatch('emailVerification/sendVerificationEmail', this.email);
      } catch (error) {
        // 오류는 Vuex에서 처리됨
        console.error('이메일 인증 요청 실패:', error);
      }
    },
    
    async verifyEmail() {
      try {
        const result = await this.$store.dispatch('emailVerification/verifyEmail', {
          email: this.email,
          verificationCode: this.verificationCode
        });
        
        console.log('인증 결과:', result);
        
        // 성공적으로 인증된 경우 사용자 정보 상태를 직접 업데이트
        if (result && this.$store.state.auth.user) {
          // 명시적으로 true 값으로 설정 (Boolean 객체가 아닌 원시값 true 사용)
          this.$store.commit('auth/UPDATE_USER', {emailVerified: true});
          console.log('인증 상태가 수동으로 업데이트되었습니다: emailVerified = true');
          
          // 강제로 사용자 정보 다시 가져오기
          setTimeout(async () => {
            try {
              await this.$store.dispatch('auth/fetchUser');
              console.log('인증 후 사용자 정보 성공적으로 새로고침되었습니다.');
              
              // 업데이트 후 상태 확인
              const updatedUser = this.$store.state.auth.user;
              console.log('업데이트된 사용자 정보:', updatedUser);
              console.log('이메일 인증 상태:', updatedUser?.emailVerified);
            } catch (refreshError) {
              console.warn('사용자 정보 새로고침 중 오류가 발생했습니다:', refreshError);
            }
          }, 500); // 상태 업데이트 후 약간의 지연을 두고 다시 가져오기
        }
      } catch (error) {
        // 오류는 Vuex에서 처리됨
        console.error('이메일 인증 코드 확인 실패:', error);
      }
    },
    
    resetVerification() {
      this.$store.dispatch('emailVerification/resetState');
      this.verificationCode = '';
    },
    
    goToSellPage() {
      // 인증 성공 후 사용자 정보 갱신을 위해 사용자 정보 다시 가져오기
      this.$store.dispatch('auth/fetchUser')
        .then(() => {
          this.$router.push({ path: '/sell', query: { emailVerified: 'true' } });
        });
    },
    
    goToProfile() {
      // 인증 성공 후 사용자 정보 갱신을 위해 사용자 정보 다시 가져오기
      this.$store.dispatch('auth/fetchUser')
        .then(() => {
          this.$router.push('/profile');
        });
    }
  }
};
</script>
