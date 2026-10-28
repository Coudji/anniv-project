<script setup lang="ts">
import { computed, ref } from 'vue'
import { Form } from '@adonisjs/inertia/vue'
import PixelIcone from '~/components/pixel_icone.vue'
import type { QuestionFront } from '~/question'

const props = defineProps<{
  categorie: string
  question: QuestionFront
}>()

// Options en images : en grille. Options en texte : une par ligne
const enImages = computed(() => props.question.options?.some((option) => option.image) ?? false)

// Image ouverte en grand (pour repérer les détails), sans changer la sélection
const agrandie = ref<string | null>(null)
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
        <input
          v-if="question.multiple"
          type="checkbox"
          name="reponse[]"
          :value="index"
          class="option__radio"
        />
        <input v-else type="radio" name="reponse" :value="index" required class="option__radio" />
        <template v-if="option.image">
          <img :src="option.image" alt="" class="option__image" />
          <button
            type="button"
            class="option__zoom"
            aria-label="Agrandir l'image"
            @click.prevent="agrandie = option.image"
          >
            <PixelIcone nom="loupe" :taille="18" />
          </button>
        </template>
        <span v-else class="option__texte">{{ option.texte }}</span>
      </label>
    </div>

    <div v-if="agrandie" class="zoom" @click="agrandie = null">
      <img :src="agrandie" alt="" />
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  position: relative;
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
  max-height: 260px;
  object-fit: contain;
}

.option__zoom {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--texte-doux);
  background: var(--fond);
  border: 2px solid var(--verrou);
}

.option__zoom:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.zoom {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 88%);
  cursor: zoom-out;
}

.zoom img {
  max-width: 95vw;
  max-height: 95vh;
}
</style>
