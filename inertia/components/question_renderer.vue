<script setup lang="ts">
import { defineAsyncComponent, type Component } from 'vue'
import MediaDisplay from '~/components/media_display.vue'
import type { QuestionFront, RetourFront } from '~/question'

defineProps<{
  categorie: string
  question: QuestionFront
  retour: RetourFront | null
}>()

const mecaniques: Record<string, Component> = {
  texte: defineAsyncComponent(() => import('./mecaniques/texte.vue')),
  choix: defineAsyncComponent(() => import('./mecaniques/choix.vue')),
  liste: defineAsyncComponent(() => import('./mecaniques/liste.vue')),
  serie: defineAsyncComponent(() => import('./mecaniques/serie.vue')),
}
</script>

<template>
  <div class="question">
    <MediaDisplay v-if="question.media" :media="question.media" />
    <component
      :is="mecaniques[question.type]"
      :categorie="categorie"
      :question="question"
      :retour="retour"
    />
  </div>
</template>

<style scoped>
.question {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
</style>
