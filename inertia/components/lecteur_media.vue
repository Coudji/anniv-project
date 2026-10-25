<script setup lang="ts">
import { computed, onUnmounted, ref, watch, watchEffect } from 'vue'
import PixelIcone from '~/components/pixel_icone.vue'
import type { MediaFront } from '~/question'
import { muet, volume } from '../volume'

/**
 * Lecteur maison pour le son et la vidéo. Il ne joue que l'extrait entre
 * `debut` et `fin`, et remplace les passages `bips` par un bip.
 */
const props = defineProps<{ media: MediaFront }>()

const element = ref<HTMLMediaElement | null>(null)
const conteneur = ref<HTMLElement | null>(null)
const enLecture = ref(false)
const dureeFichier = ref(0)
const instant = ref(0)
const dansBip = ref(false)

const debut = computed(() => props.media.debut)
const fin = computed(() => props.media.fin ?? dureeFichier.value)
const duree = computed(() => Math.max(fin.value - debut.value, 0))
const position = computed(() => Math.min(Math.max(instant.value - debut.value, 0), duree.value))

/**
 * Pendant la lecture, on surveille la position à chaque image (bien plus
 * précis que l'événement timeupdate) pour couper pile à la fin et sur les bips
 */
let boucle = 0

function suivre() {
  const el = element.value
  if (!el) return

  if (props.media.fin !== null && el.currentTime >= fin.value) {
    el.pause()
    el.currentTime = debut.value
  }

  instant.value = el.currentTime
  dansBip.value = props.media.bips.some(([a, b]) => el.currentTime >= a && el.currentTime < b)

  if (!el.paused) boucle = requestAnimationFrame(suivre)
}

function auDemarrage() {
  enLecture.value = true
  cancelAnimationFrame(boucle)
  boucle = requestAnimationFrame(suivre)
}

function aLArret() {
  enLecture.value = false
  cancelAnimationFrame(boucle)
  dansBip.value = false
}

function auChargement() {
  if (!element.value) return
  dureeFichier.value = element.value.duration
  element.value.currentTime = debut.value
  instant.value = debut.value
}

function aLaFin() {
  if (!element.value) return
  element.value.currentTime = debut.value
  instant.value = debut.value
}

function basculer() {
  const el = element.value
  if (!el) return

  if (!el.paused) {
    el.pause()
    return
  }
  if (el.currentTime < debut.value || el.currentTime >= fin.value) {
    el.currentTime = debut.value
  }
  el.play()
}

function deplacer(event: MouseEvent) {
  if (!element.value || !duree.value) return
  const barre = event.currentTarget as HTMLElement
  const ratio = (event.clientX - barre.getBoundingClientRect().left) / barre.clientWidth
  element.value.currentTime = debut.value + Math.min(Math.max(ratio, 0), 1) * duree.value
  instant.value = element.value.currentTime
}

// Volume commun à tous les lecteurs ; le son est coupé pendant un bip
watchEffect(() => {
  if (!element.value) return
  element.value.volume = volume.value
  element.value.muted = muet.value || dansBip.value
})

function regler(event: Event) {
  volume.value = Number((event.target as HTMLInputElement).value)
  muet.value = false
}

/**
 * Le bip est généré par le navigateur (Web Audio), pas besoin de fichier
 */
let contexte: AudioContext | null = null
let oscillateur: OscillatorNode | null = null

function demarrerBip() {
  contexte ??= new AudioContext()
  const gain = contexte.createGain()
  gain.gain.value = muet.value ? 0 : 0.15 * volume.value
  oscillateur = contexte.createOscillator()
  oscillateur.frequency.value = 1000
  oscillateur.connect(gain).connect(contexte.destination)
  oscillateur.start()
}

function arreterBip() {
  oscillateur?.stop()
  oscillateur = null
}

watch(
  () => dansBip.value && enLecture.value,
  (actif) => (actif ? demarrerBip() : arreterBip())
)

function pleinEcran() {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    conteneur.value?.requestFullscreen()
  }
}

onUnmounted(() => {
  cancelAnimationFrame(boucle)
  arreterBip()
  contexte?.close()
})

function formater(secondes: number) {
  const s = Math.floor(secondes)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
</script>

<template>
  <div ref="conteneur" class="cadre lecteur-media">
    <video
      v-if="media.type === 'video'"
      ref="element"
      :src="media.url"
      preload="metadata"
      playsinline
      class="lecteur-media__video"
      @click="basculer"
      @play="auDemarrage"
      @pause="aLArret"
      @ended="aLaFin"
      @loadedmetadata="auChargement"
    />
    <audio
      v-else
      ref="element"
      :src="media.url"
      preload="metadata"
      @play="auDemarrage"
      @pause="aLArret"
      @ended="aLaFin"
      @loadedmetadata="auChargement"
    />

    <div class="lecteur">
      <button
        type="button"
        class="lecteur__bouton"
        :aria-label="enLecture ? 'Pause' : 'Lecture'"
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
        class="lecteur__icone"
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
      <button
        v-if="media.type === 'video'"
        type="button"
        class="lecteur__icone"
        aria-label="Plein écran"
        @click="pleinEcran"
      >
        <PixelIcone nom="plein_ecran" :taille="20" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.lecteur-media {
  display: flex;
  flex-direction: column;
}

.lecteur-media__video {
  display: block;
  width: 100%;
  max-height: 50vh;
  background: #000;
  cursor: pointer;
}

.lecteur-media:fullscreen {
  margin: 0;
  justify-content: center;
  background: #000;
}

.lecteur-media:fullscreen .lecteur-media__video {
  flex: 1;
  max-height: none;
  min-height: 0;
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

.lecteur__temps {
  color: var(--texte-doux);
  min-width: 40px;
  text-align: right;
}

.lecteur__icone {
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

.lecteur__icone:hover {
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
</style>
