<template>
  <div class="home">
    <section class="hero">
      <div class="container">
        <h1>FreeMarket에 오신 것을 환영합니다!</h1>
        <p>거래를 더 쉽고 안전하게, 프리마켓과 함께 시작하세요.</p>
        
        <div class="hero-buttons" v-if="!isAuthenticated">
          <router-link to="/login" class="btn btn-primary">로그인</router-link>
          <router-link to="/signup" class="btn btn-secondary">회원가입</router-link>
        </div>
        
        <div class="hero-buttons" v-else>
          <router-link to="/products" class="btn btn-primary">상품 둘러보기</router-link>
          <router-link to="/profile" class="btn btn-secondary">내 정보</router-link>
        </div>
      </div>
    </section>
    
    <section class="features">
      <div class="container">
        <h2 class="text-center mb-4">FreeMarket의 특징</h2>
        
        <div class="feature-cards">
          <div class="feature-card">
            <div class="feature-icon">🛒</div>
            <h3>간편한 거래</h3>
            <p>복잡한 절차 없이 편리하게 거래하세요.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>안전한 거래</h3>
            <p>인증된 사용자와 안전하게 거래하세요.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3>합리적인 가격</h3>
            <p>중개 수수료 없이 직거래로 더 저렴하게.</p>
          </div>
        </div>
      </div>
    </section>
    
    <section class="latest-products" v-if="isAuthenticated">
      <div class="container">
        <h2 class="text-center mb-4">최근 등록된 상품</h2>
        <p class="text-center" v-if="loading">상품을 불러오는 중...</p>
        <p class="text-center" v-else-if="!latestProducts.length">아직 등록된 상품이 없습니다.</p>
        
        <div class="product-grid" v-else>
          <!-- 최근 상품 목록 표시 -->
          <div class="product-card" v-for="product in latestProducts" :key="product.id">
            <div class="product-image">
              <img :src="product.thumbnailUrl || '/placeholder.jpg'" :alt="product.name">
            </div>
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <p class="product-price">{{ formatPrice(product.price) }}</p>
              <p class="product-seller">{{ product.sellerName }}</p>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-4">
          <router-link to="/products" class="btn btn-primary">더 많은 상품 보기</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import axios from '@/api/axios' // 나중에 상품 목록을 가져올 때 사용

export default {
  name: 'Home',
  data() {
    return {
      loading: false,
      latestProducts: []
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated'])
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);
    },
    async fetchLatestProducts() {
      if (!this.isAuthenticated) return;
      
      this.loading = true;
      try {
        // 실제 API 연동 시 주석 해제
        // const response = await axios.get('/api/products?limit=6');
        // this.latestProducts = response.data.data;
        
        // 임시 데이터
        this.latestProducts = [
          { id: 1, name: '노트북', price: 800000, sellerName: '홍길동', thumbnailUrl: '' },
          { id: 2, name: '스마트폰', price: 500000, sellerName: '김철수', thumbnailUrl: '' },
          { id: 3, name: '태블릿', price: 300000, sellerName: '이영희', thumbnailUrl: '' }
        ];
      } catch (error) {
        console.error('상품 목록을 가져오는 중 오류 발생:', error);
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.fetchLatestProducts();
  }
}
</script>

<style scoped>
.hero {
  background-color: #e6f2ff;
  padding: 4rem 0;
  text-align: center;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #2d3748;
}

.hero p {
  font-size: 1.25rem;
  color: #4a5568;
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.features {
  padding: 4rem 0;
  background-color: #fff;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.latest-products {
  padding: 4rem 0;
  background-color: #f8f9fa;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.product-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 1rem;
}

.product-info h3 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.product-price {
  font-weight: bold;
  color: #4299e1;
  margin-bottom: 0.25rem;
}

.product-seller {
  color: #718096;
  font-size: 0.875rem;
}
</style>
