<script setup lang="ts">
import { ref, watch } from 'vue'
import { Form } from '@adonisjs/inertia/vue'
import PixelIcone from '~/components/pixel_icone.vue'
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
  <Form
    v-slot="{ processing }"
    route="categories.repondre"
    :params="{ id: categorie }"
    class="formulaire"
  >
    <p class="enonce">{{ question.question }}</p>

    <div class="champs">
      <div v-for="(champ, index) in champs" :key="champ.id" class="ligne">
        <input
          v-model="champ.valeur"
          name="reponse[]"
          type="text"
          autocomplete="off"
          class="champ"
          :class="{ 'champ--valide': champ.valide }"
          :readonly="champ.valide"
          :aria-label="`Élément ${index + 1}`"
          placeholder="Un élément…"
        />
        <PixelIcone v-if="champ.valide" nom="coche" :taille="22" class="ligne__coche" />
        <button
          v-else
          type="button"
          class="ligne__retirer"
          aria-label="Retirer ce champ"
          :disabled="champs.length === 1"
          @click="supprimer(index)"
        >
          −
        </button>
      </div>
    </div>

    <button type="button" class="bouton bouton--secondaire" @click="ajouter">
      + AJOUTER UN CHAMP
    </button>
    <button type="submit" class="bouton" :disabled="processing">VALIDER</button>
  </Form>
</template>

<style scoped>
.champs {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ligne {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ligne .champ {
  flex: 1;
}

.champ--valide,
.champ--valide:focus {
  background: rgba(77, 255, 154, 0.1);
  box-shadow:
    0 -4px 0 0 var(--juste),
    0 4px 0 0 var(--juste),
    -4px 0 0 0 var(--juste),
    4px 0 0 0 var(--juste);
}

.ligne__coche {
  flex: none;
  margin: 0 11px;
  color: var(--juste);
}

.ligne__retirer {
  flex: none;
  width: 44px;
  height: 44px;
  font-size: 22px;
  color: var(--texte-doux);
  background: transparent;
  border: 2px solid var(--verrou);
}

.ligne__retirer:hover:not(:disabled) {
  color: var(--texte);
  border-color: var(--texte-doux);
}

.ligne__retirer:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
