<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import PixelIcone from '~/components/pixel_icone.vue'
import { muet, volume } from '../volume'

defineProps<{
  media: { type: 'image' | 'audio'; url: string }
}>()

const agrandie = ref(false)

// Lecteur audio maison : le lecteur natif est caché, on pilote l'élément <audio>
const audio = ref<HTMLAudioElement | null>(null)
const enLecture = ref(false)
const position = ref(0)
const duree = ref(0)

// Le volume et la coupure du son sont communs à tous les lecteurs
watchEffect(() => {
  if (!audio.value) return
  audio.value.volume = volume.value
  audio.value.muted = muet.value
})

function regler(event: Event) {
  volume.value = Number((event.target as HTMLInputElement).value)
  muet.value = false
}

function basculer() {
  if (!audio.value) return
  if (audio.value.paused) {
    audio.value.play()
  } else {
    audio.value.pause()
  }
}

function deplacer(event: MouseEvent) {
  if (!audio.value || !duree.value) return
  const barre = event.currentTarget as HTMLElement
  const ratio = (event.clientX - barre.getBoundingClientRect().left) / barre.clientWidth
  audio.value.currentTime = Math.min(Math.max(ratio, 0), 1) * duree.value
}

function formater(secondes: number) {
  const s = Math.floor(secondes)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
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

    <div v-else-if="media.type === 'audio'" class="cadre lecteur">
      <audio
        ref="audio"
        :src="media.url"
        preload="metadata"
        @play="enLecture = true"
        @pause="enLecture = false"
        @ended="enLecture = false"
        @timeupdate="position = audio?.currentTime ?? 0"
        @loadedmetadata="duree = audio?.duration ?? 0"
      />
      <button
        type="button"
        class="lecteur__bouton"
        :aria-label="enLecture ? 'Pause' : 'Écouter'"
        @click="basculer"
      >
        <PixelIcone :nom="enLecture ? 'pause' : 'lecture'" :taille="22" />
      </button>
      <div class="lecteur__barre" @click="deplacer">
        <div
          class="lecteur__avancee"
          :style="{ width: duree ? `${(position / duree) * 100}%` : '0%' }"
        />
      </div>
      <span class="pixel lecteur__temps">{{ formater(position) }}</span>
      <button
        type="button"
        class="lecteur__muet"
        :aria-label="muet ? 'Remettre le son' : 'Couper le son'"
        @click="muet = !muet"
      >
        <PixelIcone :nom="muet || volume === 0 ? 'muet' : 'haut_parleur'" :taille="20" />
      </button>
      <input
        type="range"
        class="lecteur__volume"
        min="0"
        max="1"
        step="0.05"
        aria-label="Volume"
        :value="muet ? 0 : volume"
        @input="regler"
      />
    </div>
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

.lecteur {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
}

.lecteur__bouton {
  flex: none;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fond);
  background: var(--accent);
  border: none;
}

.lecteur__barre {
  flex: 1;
  height: 14px;
  background: var(--ligne);
  cursor: pointer;
}

.lecteur__avancee {
  height: 100%;
  background: var(--accent);
}

.lecteur__muet {
  flex: none;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--texte-doux);
  background: transparent;
  border: none;
}

.lecteur__muet:hover {
  color: var(--accent);
}

.lecteur__volume {
  flex: none;
  width: 80px;
  height: 8px;
  appearance: none;
  background: var(--ligne);
  cursor: pointer;
}

.lecteur__volume::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  background: var(--accent);
  border: none;
  border-radius: 0;
}

.lecteur__volume::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: var(--accent);
  border: none;
  border-radius: 0;
}

.lecteur__volume::-moz-range-progress {
  height: 8px;
  background: var(--accent-attenue);
}

/* Sur téléphone, les boutons de volume de l'appareil suffisent : on garde juste la coupure */
@media (max-width: 480px) {
  .lecteur__volume {
    display: none;
  }
}

.lecteur__temps {
  color: var(--texte-doux);
  min-width: 40px;
  text-align: right;
}
</style>
