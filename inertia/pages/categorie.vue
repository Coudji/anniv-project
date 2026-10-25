<script setup lang="ts">
import { ref, watch } from 'vue'
import { Link } from '@adonisjs/inertia/vue'
import FlashToasts from '~/components/flash_toasts.vue'
import QuestionRenderer from '~/components/question_renderer.vue'
import type { QuestionFront, RetourFront } from '../question'

const props = defineProps<{
  id: string
  nom: string
  numero: number
  total: number
  question: QuestionFront | null
  resultat: 'bonne' | 'terminee' | null
  retour: RetourFront | null
}>()

const afficherResultat = ref(props.resultat !== null)

// À chaque nouvelle réponse, on réaffiche l'écran de résultat s'il y en a un
watch(
  () => [props.numero, props.resultat],
  () => {
    afficherResultat.value = props.resultat !== null
  }
)
</script>

<template>
  <div>
    <Link route="grille">← Retour à la grille</Link>

    <h1>{{ nom }}</h1>

    <div v-if="resultat === 'terminee'">
      <p>Bonne réponse ! Catégorie terminée !</p>
      <Link route="grille">Retour à la grille</Link>
    </div>

    <div v-else-if="afficherResultat">
      <p>Bonne réponse !</p>
      <button type="button" @click="afficherResultat = false">Question suivante</button>
    </div>

    <div v-else-if="question">
      <p>Question {{ numero }} / {{ total }}</p>
      <QuestionRenderer :key="numero" :categorie="id" :question="question" :retour="retour" />
    </div>

    <FlashToasts />
  </div>
</template>
