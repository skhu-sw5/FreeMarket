import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/tailwind.css'
import { API_BASE_URL } from './config'

const app = createApp(App)

// API_BASE_URL을 전역 속성으로 등록
app.config.globalProperties.$API_BASE_URL = API_BASE_URL

app.use(router)
  .use(store)
  .mount('#app')
