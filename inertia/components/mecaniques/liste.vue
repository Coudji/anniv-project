<script setup lang="ts">
import { ref, watch } from 'vue'
import { Form } from '@adonisjs/inertia/vue'
import type { QuestionFront, RetourFront } from '~/question'

const props = defineProps<{
  categorie: string
  question: QuestionFront
  retour: RetourFront | null
}>()

type Champ = { id: number; valeur: string; valide: boolean }

let prochainId = 0

function creerChamp(valeur = '', valide = false): Champ {
  return { id: prochainId++, valeur, valide }
}

/**
 * Sans retour du serveur : un champ vide. Après une erreur : les champs
 * envoyés, avec ceux qui étaient corrects verrouillés
 */
function champsDepuis(retour: RetourFront | null) {
  if (!retour) return [creerChamp()]
  return retour.saisies.map((valeur, i) => creerChamp(valeur, retour.valides[i]))
}

const champs = ref<Champ[]>(champsDepuis(props.retour))

watch(
  () => props.retour,
  (retour) => {
    if (retour) champs.value = champsDepuis(retour)
  }
)

function ajouter() {
  champs.value.push(creerChamp())
}

function supprimer(index: number) {
  if (champs.value.length > 1) champs.value.splice(index, 1)
}
</script>

<template>
  <Form v-slot="{ processing }" route="categories.repondre" :params="{ id: categorie }">
    <p>{{ question.question }}</p>

    <div v-for="(champ, index) in champs" :key="champ.id" class="champ">
      <input
        v-model="champ.valeur"
        name="reponse[]"
        type="text"
        autocomplete="off"
        :readonly="champ.valide"
        :class="{ 'champ--valide': champ.valide }"
      />
      <button
        v-if="!champ.valide"
        type="button"
        :disabled="champs.length === 1"
        @click="supprimer(index)"
      >
        −
      </button>
    </div>

    <button type="button" @click="ajouter">+ Ajouter un champ</button>
    <button type="submit" :disabled="processing">Valider</button>
  </Form>
</template>

<style scoped>
.champ {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.champ--valide {
  border-color: green;
  background: rgb(0 128 0 / 10%);
}
</style>
