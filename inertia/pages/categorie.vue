<script setup lang="ts">
import { ref, watch } from 'vue'
import { Link } from '@adonisjs/inertia/vue'
import FlashToasts from '~/components/flash_toasts.vue'
import HistoriqueSerie from '~/components/historique_serie.vue'
import MediaDisplay from '~/components/media_display.vue'
import QuestionRenderer from '~/components/question_renderer.vue'
import type { QuestionFront, ResolueFront, RetourFront } from '../question'

const props = defineProps<{
  id: string
  nom: string
  numero: number
  total: number
  question: QuestionFront | null
  resultat: 'bonne' | 'terminee' | null
  retour: RetourFront | null
  resolue: ResolueFront | null
}>()

// L'écran de résultat reste affiché jusqu'au clic sur "Question suivante"
const afficherResolue = ref(props.resolue !== null)

watch(
  () => props.resolue,
  (resolue) => {
    afficherResolue.value = resolue !== null
  }
)
</script>

<template>
  <div>
    <Link route="grille">← Retour à la grille</Link>

    <h1>{{ nom }}</h1>

    <div v-if="resolue && (afficherResolue || !question)">
      <p>{{ resolue.question }}</p>
      <MediaDisplay v-if="resolue.media" :media="resolue.media" />
      <HistoriqueSerie v-if="resolue.serie" :lignes="resolue.serie" />

      <p class="bravo">{{ resolue.serie ? 'Série réussie !' : 'Bonne réponse !' }}</p>

      <div v-if="resolue.apres" class="apres">
        <p v-if="resolue.apres.texte" class="apres__texte">{{ resolue.apres.texte }}</p>
        <MediaDisplay v-for="(media, index) in resolue.apres.medias" :key="index" :media="media" />
      </div>

      <button v-if="question" type="button" @click="afficherResolue = false">
        Question suivante
      </button>
      <template v-else>
        <p>Catégorie terminée !</p>
        <Link route="grille">Retour à la grille</Link>
      </template>
    </div>

    <div v-else-if="question">
      <p>Question {{ numero }} / {{ total }}</p>
      <QuestionRenderer :key="numero" :categorie="id" :question="question" :retour="retour" />
    </div>

    <FlashToasts />
  </div>
</template>

<style scoped>
.bravo {
  font-weight: bold;
}

.apres__texte {
  white-space: pre-line;
}
</style>
