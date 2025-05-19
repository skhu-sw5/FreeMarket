<template>
  <div>
    <div class="mb-4 rounded-lg overflow-hidden bg-gray-100">
      <img 
        :src="images[selectedIndex]?.url || 'https://via.placeholder.com/600x400'" 
        alt="상품 이미지" 
        class="w-full h-80 md:h-96 object-contain"
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
        <img :src="image.thumbnail" :alt="`썸네일 ${index + 1}`" class="w-full h-16 object-cover" />
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
      selectedIndex: 0
    }
  },
  
  watch: {
    images() {
      this.selectedIndex = 0
    }
  }
}
</script>
