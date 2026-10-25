<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '@adonisjs/inertia/vue'
import HistoriqueSerie from '~/components/historique_serie.vue'
import type { QuestionFront } from '~/question'

const props = defineProps<{
  categorie: string
  question: QuestionFront
}>()

const router = useRouter()
const envoi = ref(false)

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
  <div v-if="question.serie">
    <p>{{ question.question }}</p>
    <p class="compteur">{{ question.serie.compteur }} / {{ question.serie.objectif }}</p>

    <div class="duel">
      <button type="button" class="pokemon" :disabled="envoi" @click="repondre('a')">
        <img :src="question.serie.paire.a.image" alt="" />
        <span>{{ question.serie.paire.a.nom }}</span>
      </button>

      <button type="button" :disabled="envoi" @click="repondre('egal')">Égal</button>

      <button type="button" class="pokemon" :disabled="envoi" @click="repondre('b')">
        <img :src="question.serie.paire.b.image" alt="" />
        <span>{{ question.serie.paire.b.nom }}</span>
      </button>
    </div>

    <HistoriqueSerie v-if="question.serie.historique.length" :lignes="question.serie.historique" />
  </div>
</template>

<style scoped>
.compteur {
  font-size: 1.5rem;
  font-weight: bold;
}

.duel {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pokemon {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pokemon img {
  width: 120px;
  height: 120px;
}
</style>
