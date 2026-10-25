<script setup lang="ts">
import { defineAsyncComponent, type Component } from 'vue'

defineProps<{
  categorie: string
  question: { type: string; question: string }
}>()

const mecaniques: Record<string, Component> = {
  texte: defineAsyncComponent(() => import('./mecaniques/texte.vue')),
}
</script>

<template>
  <component :is="mecaniques[question.type]" :categorie="categorie" :question="question" />
</template>
