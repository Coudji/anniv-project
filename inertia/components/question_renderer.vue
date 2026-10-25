<script setup lang="ts">
import { defineAsyncComponent, type Component } from 'vue'
import MediaDisplay from '~/components/media_display.vue'
import type { QuestionFront } from '~/question'

defineProps<{
  categorie: string
  question: QuestionFront
}>()

const mecaniques: Record<string, Component> = {
  texte: defineAsyncComponent(() => import('./mecaniques/texte.vue')),
  choix: defineAsyncComponent(() => import('./mecaniques/choix.vue')),
}
</script>

<template>
  <div>
    <MediaDisplay v-if="question.media" :media="question.media" />
    <component :is="mecaniques[question.type]" :categorie="categorie" :question="question" />
  </div>
</template>
