<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from '@adonisjs/inertia/vue'
import HistoriqueSerie from '~/components/historique_serie.vue'
import type { QuestionFront } from '~/question'

const props = defineProps<{
  categorie: string
  question: QuestionFront
}>()

const router = useRouter()
const envoi = ref(false)

// Une barre de segments tant que l'objectif reste raisonnable, sinon le compteur seul suffit
const segments = computed(() => {
  const serie = props.question.serie
  if (!serie || serie.objectif > 20) return []
  return Array.from({ length: serie.objectif }, (_, i) => i < serie.compteur)
})

function repondre(choix: 'a' | 'egal' | 'b') {
  router.post(
    { route: 'categories.repondre', routeParams: { id: props.categorie } },
    { reponse: choix },
    {
      preserveScroll: true,
      onStart: () => (envoi.value = true),
      onFinish: () => (envoi.value = false),
    }
  )
}
</script>

<template>
  <div v-if="question.serie" class="serie">
    <p class="enonce">{{ question.question }}</p>

    <div class="score">
      <span class="score__compteur">
        {{ question.serie.compteur }} / {{ question.serie.objectif }}
      </span>
      <div v-if="segments.length" class="segments">
        <div
          v-for="(plein, index) in segments"
          :key="index"
          class="segment score__segment"
          :class="{ 'segment--plein': plein }"
        />
      </div>
    </div>

    <div class="duel">
      <button type="button" class="cadre pokemon" :disabled="envoi" @click="repondre('a')">
        <img :src="question.serie.paire.a.image" alt="" class="pokemon__image" />
        <span class="pokemon__nom">{{ question.serie.paire.a.nom }}</span>
      </button>

      <button type="button" class="egal" :disabled="envoi" @click="repondre('egal')">EGAL</button>

      <button type="button" class="cadre pokemon" :disabled="envoi" @click="repondre('b')">
        <img :src="question.serie.paire.b.image" alt="" class="pokemon__image" />
        <span class="pokemon__nom">{{ question.serie.paire.b.nom }}</span>
      </button>
    </div>

    <HistoriqueSerie v-if="question.serie.historique.length" :lignes="question.serie.historique" />
  </div>
</template>

<style scoped>
.serie {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.score__compteur {
  font-family: var(--police-pixel);
  font-size: 22px;
  color: var(--accent);
  text-shadow: 0 0 12px var(--accent-halo);
}

.score__segment {
  width: 12px;
  height: 14px;
}

.duel {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pokemon {
  flex: 1;
  min-width: 0;
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--texte);
  border: none;
  transition: background 0.15s;
}

.pokemon:hover:not(:disabled) {
  --cadre: var(--accent);
  background: var(--accent-fond);
}

.pokemon:disabled {
  cursor: wait;
}

.pokemon__image {
  width: 100%;
  max-width: 140px;
  aspect-ratio: 1;
  object-fit: contain;
}

.pokemon__nom {
  font-size: 16px;
  font-weight: 600;
}

.egal {
  flex: none;
  min-width: 56px;
  min-height: 56px;
  padding: 0 8px;
  font-family: var(--police-pixel);
  font-size: 9px;
  color: var(--fond);
  background: var(--accent);
  border: none;
}

.egal:hover:not(:disabled) {
  filter: brightness(1.12);
}
</style>
