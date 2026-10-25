<script setup lang="ts">
import { defineAsyncComponent, type Component } from 'vue'
import MediaDisplay from '~/components/media_display.vue'

defineProps<{
  categorie: string
  question: {
    type: string
    question: string
    media: { type: 'image' | 'audio'; url: string } | null
  }
}>()

const mecaniques: Record<string, Component> = {
  texte: defineAsyncComponent(() => import('./mecaniques/texte.vue')),
}
</script>

<template>
  <div>
    <MediaDisplay v-if="question.media" :media="question.media" />
    <component :is="mecaniques[question.type]" :categorie="categorie" :question="question" />
  </div>
</template>
