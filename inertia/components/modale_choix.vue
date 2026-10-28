<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

/**
 * Modale de choix : une liste de textes à scroller, ou une grille d'images.
 * Se ferme avec la croix, un clic à côté ou la touche Échap.
 */
defineProps<{
  titre: string
  valeurs?: string[]
  images?: { valeur: string; url: string }[]
  choisie?: string
}>()

const emit = defineEmits<{
  choisir: [valeur: string]
  fermer: []
}>()

function fermerAvecEchap(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('fermer')
}

onMounted(() => window.addEventListener('keydown', fermerAvecEchap))
onBeforeUnmount(() => window.removeEventListener('keydown', fermerAvecEchap))
</script>

<template>
  <div class="modale" @click.self="emit('fermer')">
    <div class="cadre modale__panneau" role="dialog" :aria-label="titre">
      <div class="modale__entete">
        <span class="pixel modale__titre">{{ titre.toUpperCase() }}</span>
        <button type="button" class="modale__fermer" aria-label="Fermer" @click="emit('fermer')">
          ✕
        </button>
      </div>

      <div v-if="images" class="modale__grille">
        <button
          v-for="image in images"
          :key="image.valeur"
          type="button"
          class="vignette"
          :class="{ 'vignette--choisie': choisie === image.valeur }"
          @click="emit('choisir', image.valeur)"
        >
          <img :src="image.url" alt="" loading="lazy" />
        </button>
      </div>

      <div v-else class="modale__liste">
        <button
          v-for="valeur in valeurs"
          :key="valeur"
          type="button"
          class="ligne-choix"
          :class="{ 'ligne-choix--choisie': choisie === valeur }"
          @click="emit('choisir', valeur)"
        >
          {{ valeur }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modale {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgb(0 0 0 / 80%);
}

.modale__panneau {
  width: min(520px, 100%);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modale__entete {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 2px solid var(--ligne);
}

.modale__titre {
  color: var(--accent);
}

.modale__fermer {
  width: 36px;
  height: 36px;
  font-size: 16px;
  color: var(--texte-doux);
  background: transparent;
  border: 2px solid var(--verrou);
  cursor: pointer;
}

.modale__fermer:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.modale__liste {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 8px;
}

.ligne-choix {
  padding: 12px 14px;
  font-size: 16px;
  text-align: left;
  color: var(--texte);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--ligne);
  cursor: pointer;
}

.ligne-choix:hover {
  background: var(--accent-fond);
}

.ligne-choix--choisie {
  color: var(--accent);
  font-weight: 700;
}

.modale__grille {
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  gap: 8px;
  padding: 12px;
}

.vignette {
  aspect-ratio: 1;
  padding: 8px;
  background: var(--panneau-sombre);
  border: 2px solid var(--ligne);
  cursor: pointer;
}

.vignette:hover {
  border-color: var(--accent);
}

.vignette--choisie {
  border-color: var(--accent);
  background: var(--accent-fond);
}

.vignette img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
