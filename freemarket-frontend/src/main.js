import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/tailwind.css'
import { API_BASE_URL } from './config'

const app = createApp(App)

// API_BASE_URL을 전역 속성으로 등록
app.config.globalProperties.$API_BASE_URL = API_BASE_URL

// Vue 전역 오류 핸들러 설정
app.config.errorHandler = (err, vm, info) => {
  // Chrome 확장 프로그램 관련 오류 필터링
  const errorMessage = err.message || err.toString();
  const filteredKeywords = [
    'runtime.lastError',
    'message port closed',
    'Extension context invalidated',
    'Cannot access chrome',
    'Receiving end does not exist'
  ];
  
  // 필터링된 오류는 무시
  if (filteredKeywords.some(keyword => 
      errorMessage.toLowerCase().includes(keyword.toLowerCase())
  )) {
    return;
  }
  
  // 실제 애플리케이션 오류만 콘솔에 출력
  console.error('Vue Error:', err);
  console.error('Vue Info:', info);
  
  // 개발 환경에서만 추가 정보 출력
  if (process.env.NODE_ENV === 'development') {
    console.error('Component:', vm);
  }
};

// Vue 경고 핸들러 설정 (개발 환경)
if (process.env.NODE_ENV === 'development') {
  app.config.warnHandler = (msg, vm, trace) => {
    // 특정 경고 메시지 필터링
    if (msg.includes('runtime.lastError') || 
        msg.includes('Extension context')) {
      return;
    }
    console.warn('Vue Warning:', msg);
    console.warn('Trace:', trace);
  };
}

app.use(router)
  .use(store)
  .mount('#app')
