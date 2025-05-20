import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ProductList from '../views/ProductList.vue'
import ProductDetail from '../views/ProductDetail.vue'
import LoginView from '../views/auth/Login.vue'
import RegisterView from '../views/auth/Register.vue'
import ProfileView from '../views/user/Profile.vue'
import WishlistView from '../views/user/Wishlist.vue'
import SellProduct from '../views/SellProduct.vue'
import EditProduct from '../views/EditProduct.vue'
import EmailVerificationPage from '../views/user/EmailVerificationPage.vue'
import OrdersView from '../views/user/Orders.vue'
import OrderComplete from '../views/OrderComplete.vue'
import store from '../store'

// 정적 페이지
import AboutPage from '../views/static/AboutPage.vue'
import TermsPage from '../views/static/TermsPage.vue'
import PrivacyPage from '../views/static/PrivacyPage.vue'
import FaqPage from '../views/static/FaqPage.vue'
import ContactPage from '../views/static/ContactPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/products',
    name: 'ProductList',
    component: ProductList
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    props: true
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: WishlistView,
    meta: { requiresAuth: true }
  },
  {
    path: '/sell',
    name: 'SellProduct',
    component: SellProduct,
    meta: { requiresAuth: true }
  },
  {
    path: '/products/:id/edit',
    name: 'EditProduct',
    component: EditProduct,
    meta: { requiresAuth: true }
  },
  {
    path: '/email-verification',
    name: 'EmailVerification',
    component: EmailVerificationPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/orders',
    name: 'Orders',
    component: OrdersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/:id/complete',
    name: 'OrderComplete',
    component: OrderComplete,
    props: true,
    meta: { requiresAuth: true }
  },
  
  // 정적 페이지
  {
    path: '/about',
    name: 'About',
    component: AboutPage
  },
  {
    path: '/terms',
    name: 'Terms',
    component: TermsPage
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: PrivacyPage
  },
  {
    path: '/faq',
    name: 'Faq',
    component: FaqPage
  },
  {
    path: '/contact',
    name: 'Contact',
    component: ContactPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 인증 관련 네비게이션 가드
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 토큰이 없는 경우 로그인 페이지로 리다이렉트
    if (!token) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
    
    // 토큰은 있지만 인증이 만료된 경우 리프레시 시도
    if (token && refreshToken) {
      try {
        // fetchUser 시도 - 토큰이 유효하면 사용자 정보를 가져옴
        // 토큰이 만료되면 내부적으로 refreshToken 액션이 실행됨
        await store.dispatch('auth/fetchUser')
        next() // 사용자 정보 가져오기 성공, 계속 진행
      } catch (error) {
        console.error('인증 확인 오류:', error)
        // 리프레시 토큰도 만료된 경우 로그인 페이지로 리다이렉트
        next({ name: 'Login', query: { redirect: to.fullPath } })
      }
    } else {
      // 리프레시 토큰이 없는 경우 로그인 페이지로 리다이렉트
      next({ name: 'Login', query: { redirect: to.fullPath } })
    }
  } else {
    // 인증이 필요하지 않은 페이지는 그냥 진행
    next()
  }
})

export default router
