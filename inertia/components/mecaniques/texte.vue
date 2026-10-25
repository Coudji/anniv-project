<script setup lang="ts">
import { Form } from '@adonisjs/inertia/vue'

defineProps<{
  categorie: string
  question: { question: string }
}>()
</script>

<template>
  <Form
    v-slot="{ processing }"
    route="categories.repondre"
    :params="{ id: categorie }"
    class="formulaire"
  >
    <p class="enonce">{{ question.question }}</p>

    <label for="reponse" class="etiquette">TA REPONSE</label>
    <input
      id="reponse"
      name="reponse"
      type="text"
      autocomplete="off"
      autofocus
      class="champ"
      placeholder="Tape ta réponse…"
    />

    <button type="submit" class="bouton" :disabled="processing">VALIDER</button>
  </Form>
</template>
