import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
// import OAuthCallback from '../views/OAuthCallback.vue'
import OAuthCallbackSimple from '../views/OAuthCallbackSimple.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // 지연 로딩 예시
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/oauth/callback',
    name: 'OAuthCallback',
    component: OAuthCallbackSimple // 단순화된 콜백 컴포넌트 사용
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import(/* webpackChunkName: "reset-password" */ '../views/ResetPassword.vue')
  },
  // 다른 라우트 경로들...
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 네비게이션 가드 - 인증이 필요한 라우트 보호
router.beforeEach((to, from, next) => {
  const publicPages = ['/', '/login', '/signup', '/oauth/callback', '/reset-password'];
  const authRequired = !publicPages.includes(to.path) && !to.path.includes('/oauth/');
  const loggedIn = localStorage.getItem('accessToken');

  // 인증이 필요한 페이지에 접근하려는데 로그인이 안되어 있으면 로그인 페이지로 리다이렉트
  if (authRequired && !loggedIn) {
    localStorage.setItem('redirectPath', to.fullPath); // 로그인 후 원래 가려던 페이지로 리다이렉트하기 위해 저장
    next('/login');
  } else {
    next(); // 정상적으로 라우트 이동 허용
  }
});

export default router
