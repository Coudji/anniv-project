<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  media: { type: 'image' | 'audio'; url: string }
}>()

const agrandie = ref(false)
</script>

<template>
  <div class="media">
    <template v-if="media.type === 'image'">
      <img :src="media.url" alt="" class="media__image" @click="agrandie = true" />

      <div v-if="agrandie" class="media__zoom" @click="agrandie = false">
        <img :src="media.url" alt="" />
      </div>
    </template>

    <audio v-else-if="media.type === 'audio'" :src="media.url" controls />
  </div>
</template>

<style scoped>
.media__image {
  max-width: 100%;
  max-height: 50vh;
  cursor: zoom-in;
}

.media__zoom {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 85%);
  cursor: zoom-out;
}

.media__zoom img {
  max-width: 95vw;
  max-height: 95vh;
}
</style>
