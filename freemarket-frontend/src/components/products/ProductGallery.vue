<template>
  <div>
    <div class="mb-4 rounded-lg overflow-hidden bg-gray-100">
      <img 
        :src="getImageUrl(getCurrentImage())" 
        alt="상품 이미지" 
        class="w-full h-80 md:h-96 object-contain"
        @error="handleImageError"
      />
    </div>
    
    <div v-if="images.length > 1" class="grid grid-cols-5 gap-2">
      <div 
        v-for="(image, index) in images" 
        :key="index"
        @click="selectedIndex = index"
        :class="[
          'cursor-pointer rounded-md overflow-hidden border-2',
          selectedIndex === index ? 'border-blue-500' : 'border-transparent'
        ]"
      >
        <img 
          :src="getImageUrl(getThumbnailImage(image))" 
          :alt="`썸네일 ${index + 1}`" 
          class="w-full h-16 object-cover"
          @error="handleImageError"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductGallery',
  
  props: {
    images: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      selectedIndex: 0,
      baseUrl: 'https://freemarket.duckdns.org' // API 서버 기본 URL
    }
  },

  mounted() {
    console.log('ProductGallery mounted - 받은 이미지 데이터:', this.images);
    if (this.images.length > 0) {
      console.log('첫 번째 이미지:', this.images[0]);
      console.log('처리된 URL:', this.getImageUrl(this.getCurrentImage()));
    }
  },
  
  methods: {
    getImageUrl(url) {
      if (!url) return 'https://via.placeholder.com/600x400';
      
      // 이미 전체 URL인 경우 그대로 반환
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      
      // 상대 경로인 경우 baseUrl 추가
      return `${this.baseUrl}${url}`;
    },
    
    getCurrentImage() {
      const image = this.images[this.selectedIndex];
      if (!image) return null;
      
      // 다양한 이미지 구조 처리
      return image.url || image.src || image.imageUrl || image;
    },
    
    getThumbnailImage(image) {
      if (!image) return null;
      
      // 썸네일이 있으면 썸네일 사용, 없으면 원본 이미지 사용
      return image.thumbnail || image.thumbnailUrl || image.url || image.src || image.imageUrl || image;
    },
    
    handleImageError(event) {
      console.warn('이미지 로드 실패:', event.target.src);
      event.target.src = 'https://via.placeholder.com/600x400?text=이미지를+불러올+수+없습니다';
    }
  },
  
  watch: {
    images() {
      this.selectedIndex = 0
    }
  }
}
</script>
