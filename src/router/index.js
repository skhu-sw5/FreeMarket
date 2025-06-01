import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ProductList from '../views/ProductList.vue'
import ProductDetail from '../views/ProductDetail.vue'
import LoginView from '../views/auth/Login.vue'
import RegisterView from '../views/auth/Register.vue'
import PasswordResetRequestView from '../views/auth/PasswordResetRequest.vue'
import PasswordResetView from '../views/auth/PasswordReset.vue'
import OAuthCallbackView from '../views/auth/OAuthCallback.vue'
import ProfileView from '../views/user/Profile.vue'
import ChangePasswordView from '../views/user/ChangePassword.vue'
import WishlistView from '../views/user/Wishlist.vue'
import SellProduct from '../views/SellProduct.vue'
import EditProduct from '../views/EditProduct.vue'
import EmailVerificationPage from '../views/user/EmailVerificationPage.vue'
import OrdersView from '../views/user/Orders.vue'
import OrderComplete from '../views/OrderComplete.vue'
import MyReviewsView from '../views/user/MyReviews.vue'
import MyProductsView from '../views/user/MyProducts.vue'
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
    path: '/password-reset-request',
    name: 'PasswordResetRequest',
    component: PasswordResetRequestView
  },
  {
    path: '/password-reset',
    name: 'PasswordReset',
    component: PasswordResetView
  },
  {
    path: '/reset-password',
    redirect: to => {
      return { path: '/password-reset', query: to.query };
    }
  },
  {
    path: '/oauth/callback',
    name: 'OAuthCallback',
    component: OAuthCallbackView
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/change-password',
    name: 'ChangePassword',
    component: ChangePasswordView,
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
    path: '/user/reviews',
    name: 'MyReviews',
    component: MyReviewsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/products',
    name: 'MyProducts',
    component: MyProductsView,
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
  const isAuthenticated = store.getters['auth/isAuthenticated']
  const isInitialized = store.getters['auth/isInitialized']
  
  // 앱이 아직 초기화되지 않았다면 초기화 완료까지 대기
  if (!isInitialized) {
    console.log('라우터 가드: 앱 초기화 대기 중...');
    
    // 초기화 완료까지 최대 5초 대기
    let attempts = 0;
    const maxAttempts = 50; // 5초 (100ms * 50)
    
    while (!store.getters['auth/isInitialized'] && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!store.getters['auth/isInitialized']) {
      console.warn('앱 초기화 시간 초과, 강제 진행');
      // 타임아웃 시 강제로 초기화 완료로 설정
      store.commit('auth/SET_INITIALIZED', true);
    } else {
      console.log('라우터 가드: 앱 초기화 완료');
    }
  }
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 인증이 필요한 페이지
    if (isAuthenticated) {
      console.log('라우터 가드: 인증된 사용자, 계속 진행');
      next()
    } else {
      console.log('라우터 가드: 인증되지 않은 사용자, 로그인 페이지로 리다이렉트');
      next({ 
        name: 'Login', 
        query: { redirect: to.fullPath } 
      })
    }
  } else {
    // 인증이 필요하지 않은 페이지
    
    // 로그인/회원가입 페이지에 이미 로그인된 사용자가 접근하는 경우
    if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
      console.log('라우터 가드: 이미 로그인된 사용자, 홈으로 리다이렉트');
      next({ name: 'Home' })
    } else {
      next()
    }
  }
})

export default router
