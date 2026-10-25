<script setup lang="ts">
import { computed } from 'vue'
import { Form } from '@adonisjs/inertia/vue'
import type { QuestionFront } from '~/question'

const props = defineProps<{
  categorie: string
  question: QuestionFront
}>()

// Options en images : en grille. Options en texte : une par ligne
const enImages = computed(() => props.question.options?.some((option) => option.image) ?? false)
</script>

<template>
  <Form
    v-slot="{ processing }"
    route="categories.repondre"
    :params="{ id: categorie }"
    class="formulaire"
  >
    <p class="enonce">{{ question.question }}</p>

    <div class="options" :class="{ 'options--images': enImages }">
      <label v-for="(option, index) in question.options" :key="index" class="cadre option">
        <input type="radio" name="reponse" :value="index" required class="option__radio" />
        <img v-if="option.image" :src="option.image" alt="" class="option__image" />
        <span v-else class="option__texte">{{ option.texte }}</span>
      </label>
    </div>

    <button type="submit" class="bouton" :disabled="processing">VALIDER</button>
  </Form>
</template>

<style scoped>
.options {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.options--images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
}

.option {
  --cadre: var(--verrou);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
}

.options--images .option {
  flex-direction: column;
  padding: 10px;
}

.option:hover {
  --cadre: var(--accent-attenue);
}

.option:has(.option__radio:checked) {
  --cadre: var(--accent);
  background: var(--accent-fond);
  box-shadow:
    0 -4px 0 0 var(--cadre),
    0 4px 0 0 var(--cadre),
    -4px 0 0 0 var(--cadre),
    4px 0 0 0 var(--cadre),
    0 0 20px 2px var(--accent-halo);
}

.option__radio {
  flex: none;
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
}

.option__texte {
  font-size: 17px;
  font-weight: 500;
}

.option__image {
  display: block;
  width: 100%;
  max-height: 200px;
  object-fit: contain;
}
</style>
