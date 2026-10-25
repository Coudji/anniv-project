<script setup lang="ts">
import { Form } from '@adonisjs/inertia/vue'
import type { QuestionFront } from '~/question'

defineProps<{
  categorie: string
  question: QuestionFront
}>()
</script>

<template>
  <Form v-slot="{ processing }" route="categories.repondre" :params="{ id: categorie }">
    <p>{{ question.question }}</p>

    <div class="options">
      <label v-for="(option, index) in question.options" :key="index" class="option">
        <input type="radio" name="reponse" :value="index" required />
        <img v-if="option.image" :src="option.image" alt="" />
        <span v-else>{{ option.texte }}</span>
      </label>
    </div>

    <button type="submit" :disabled="processing">Valider</button>
  </Form>
</template>

<style scoped>
.options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.option img {
  max-width: 200px;
  max-height: 200px;
}
</style>
