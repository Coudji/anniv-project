<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '@adonisjs/inertia/vue'
import type { QuestionFront } from '~/question'

const props = defineProps<{
  categorie: string
  question: QuestionFront
}>()

const router = useRouter()
const envoi = ref(false)

function repondre(choix: 'a' | 'egal' | 'b') {
  router.post(
    { route: 'categories.repondre', routeParams: { id: props.categorie } },
    { reponse: choix },
    {
      preserveScroll: true,
      onStart: () => (envoi.value = true),
      onFinish: () => (envoi.value = false),
    }
  )
}
</script>

<template>
  <div v-if="question.serie">
    <p>{{ question.question }}</p>
    <p class="compteur">{{ question.serie.compteur }} / {{ question.serie.objectif }}</p>

    <div class="duel">
      <button type="button" class="pokemon" :disabled="envoi" @click="repondre('a')">
        <img :src="question.serie.paire.a.image" alt="" />
        <span>{{ question.serie.paire.a.nom }}</span>
      </button>

      <button type="button" :disabled="envoi" @click="repondre('egal')">Égal</button>

      <button type="button" class="pokemon" :disabled="envoi" @click="repondre('b')">
        <img :src="question.serie.paire.b.image" alt="" />
        <span>{{ question.serie.paire.b.nom }}</span>
      </button>
    </div>

    <div v-if="question.serie.historique.length" class="historique">
      <table>
        <tr
          v-for="(ligne, index) in question.serie.historique"
          :key="question.serie.historique.length - index"
          :class="ligne.correct ? 'ligne--juste' : 'ligne--faux'"
        >
          <td class="cellule">
            <img :src="ligne.a.image" alt="" />
            <span>{{ ligne.a.nom }}<br />{{ ligne.a.valeur }}</span>
          </td>
          <td class="signe">{{ ligne.signe }}</td>
          <td class="cellule">
            <img :src="ligne.b.image" alt="" />
            <span>{{ ligne.b.nom }}<br />{{ ligne.b.valeur }}</span>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style scoped>
.compteur {
  font-size: 1.5rem;
  font-weight: bold;
}

.duel {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pokemon {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pokemon img {
  width: 120px;
  height: 120px;
}

.historique {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 16px;
}

.historique table {
  border-collapse: collapse;
}

.cellule {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cellule img {
  width: 40px;
  height: 40px;
}

.signe {
  padding: 0 12px;
  font-size: 1.5rem;
}

.ligne--juste {
  background: rgb(0 128 0 / 15%);
}

.ligne--faux {
  background: rgb(200 0 0 / 15%);
}
</style>
