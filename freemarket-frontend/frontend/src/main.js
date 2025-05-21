import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/main.css'
// axios 설정 import
import './api/axios'

const app = createApp(App)

// Vue 애플리케이션에 스토어와 라우터 연결
app.use(store)
app.use(router)

// 글로벌 에러 핸들러 추가
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue 에러:', err)
  console.error('컴포넌트:', vm)
  console.error('Info:', info)
}

// 애플리케이션 마운트
app.mount('#app')

// 개발 환경에서 Vue 인스턴스 콘솔에 노출 (디버깅용)
if (process.env.NODE_ENV === 'development') {
  window.app = app
}
