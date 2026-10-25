<script setup lang="ts">
import { Form } from '@adonisjs/inertia/vue'

defineProps<{
  categorie: string
  question: { question: string }
}>()
</script>

<template>
  <Form v-slot="{ processing }" route="categories.repondre" :params="{ id: categorie }">
    <p>{{ question.question }}</p>
    <input name="reponse" type="text" autocomplete="off" />
    <button type="submit" :disabled="processing">Valider</button>
  </Form>
</template>
