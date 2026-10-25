<script setup lang="ts">
import { ref } from 'vue'
import LecteurMedia from '~/components/lecteur_media.vue'
import type { MediaFront } from '~/question'

defineProps<{
  media: MediaFront
}>()

const agrandie = ref(false)
</script>

<template>
  <div class="media">
    <template v-if="media.type === 'image'">
      <button
        type="button"
        class="cadre media__vignette"
        aria-label="Agrandir l'image"
        @click="agrandie = true"
      >
        <img :src="media.url" alt="" />
      </button>

      <div v-if="agrandie" class="media__zoom" @click="agrandie = false">
        <img :src="media.url" alt="" />
      </div>
    </template>

    <LecteurMedia v-else :media="media" />
  </div>
</template>

<style scoped>
.media__vignette {
  display: block;
  width: calc(100% - 8px);
  padding: 10px;
  border: none;
  cursor: zoom-in;
}

.media__vignette img {
  display: block;
  max-width: 100%;
  max-height: 45vh;
  margin: 0 auto;
}

.media__zoom {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 88%);
  cursor: zoom-out;
}

.media__zoom img {
  max-width: 95vw;
  max-height: 95vh;
}
</style>
