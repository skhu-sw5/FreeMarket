import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ProductList from '../views/ProductList.vue'
import ProductDetail from '../views/ProductDetail.vue'
import LoginView from '../views/auth/Login.vue'
import RegisterView from '../views/auth/Register.vue'
import ProfileView from '../views/user/Profile.vue'
import WishlistView from '../views/user/Wishlist.vue'
import SellProduct from '../views/SellProduct.vue'
import EmailVerificationPage from '../views/user/EmailVerificationPage.vue'

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
    path: '/email-verification',
    name: 'EmailVerification',
    component: EmailVerificationPage,
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
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')
  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
