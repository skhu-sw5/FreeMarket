<template>
  <div>
    <div class="mb-4 rounded-lg overflow-hidden bg-gray-100">
      <img 
        :src="getImageUrl(getCurrentImage()) || '/default-image.png'" 
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
          v-if="getImageUrl(getThumbnailImage(image))"
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
    if (this.images.length > 0) {
      console.log('첫 번째 이미지: ' + JSON.stringify(this.images[0]));
      console.log('getCurrentImage() 결과: ' + JSON.stringify(this.getCurrentImage()));
      console.log('getImageUrl(getCurrentImage()) 결과: ' + this.getImageUrl(this.getCurrentImage()));
    }
  },
  
  methods: {
    getImageUrl(url) {
      if (!url || typeof url !== 'string' || url.trim() === '') return null;
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `https://freemarket.duckdns.org${url}`;
    },
    
    getCurrentImage() {
      const image = this.images[this.selectedIndex];
      if (!image) return null;
      if (typeof image === 'object') {
        return image.url || image.src || image.imageUrl || image.thumbnail || image.thumbnailUrl || null;
      }
      if (typeof image === 'string') return image;
      return null;
    },
    
    getThumbnailImage(image) {
      if (!image) return null;
      if (typeof image === 'object') {
        return image.thumbnail || image.thumbnailUrl || image.url || image.src || image.imageUrl || null;
      }
      if (typeof image === 'string') return image;
      return null;
    },
    
    handleImageError(event) {
      if (event.target.src.includes('default-image.png')) return;
      event.target.onerror = null;
      event.target.src = '/default-image.png';
    }
  },
  
  watch: {
    images() {
      this.selectedIndex = 0
    }
  }
}
</script>
