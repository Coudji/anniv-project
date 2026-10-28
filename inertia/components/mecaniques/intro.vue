<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from '@adonisjs/inertia/vue'
import LecteurMedia from '~/components/lecteur_media.vue'
import ModaleChoix from '~/components/modale_choix.vue'
import type { MediaFront, QuestionFront } from '~/question'

const props = defineProps<{
  categorie: string
  question: QuestionFront
}>()

const router = useRouter()
const envoi = ref(false)
const choix = ref<string | null>(null)
const ouverte = ref(false)

// Nouvelle musique (après une erreur) : on repart d'un choix vide
watch(
  () => props.question.intro,
  () => {
    choix.value = null
    ouverte.value = false
  }
)

const musique = computed<MediaFront>(() => ({
  type: 'audio',
  url: props.question.intro!.audio,
  debut: 0,
  fin: null,
  bips: [],
}))

function choisir(jeu: string) {
  choix.value = jeu
  ouverte.value = false
}

function valider() {
  if (!choix.value) return
  router.post(
    { route: 'categories.repondre', routeParams: { id: props.categorie } },
    { reponse: choix.value },
    {
      preserveScroll: true,
      onStart: () => (envoi.value = true),
      onFinish: () => (envoi.value = false),
    }
  )
}
</script>

<template>
  <div v-if="question.intro" class="intro">
    <p class="enonce">{{ question.question }}</p>

    <!-- La clé recrée le lecteur à chaque nouvelle musique -->
    <LecteurMedia :key="question.intro.audio" :media="musique" />

    <button
      type="button"
      class="cadre case"
      :class="{ 'case--remplie': choix }"
      :disabled="envoi"
      @click="ouverte = true"
    >
      <span class="pixel case__libelle">JEU</span>
      <span v-if="choix" class="case__valeur">{{ choix }}</span>
      <span v-else class="case__vide">Choisir…</span>
    </button>

    <button type="button" class="bouton" :disabled="!choix || envoi" @click="valider">
      VALIDER
    </button>

    <ModaleChoix
      v-if="ouverte"
      titre="Jeu"
      :valeurs="question.intro.jeux"
      :choisie="choix ?? undefined"
      @choisir="choisir"
      @fermer="ouverte = false"
    />
  </div>
</template>

<style scoped>
.intro {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.case {
  min-height: 92px;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--texte);
  border: none;
  cursor: pointer;
}

.case:hover:not(:disabled) {
  --cadre: var(--accent);
}

.case--remplie {
  --cadre: var(--accent);
  background: var(--accent-fond);
}

.case__libelle {
  color: var(--texte-doux);
}

.case__valeur {
  font-size: 17px;
  font-weight: 600;
  text-align: center;
}

.case__vide {
  font-size: 15px;
  color: var(--texte-doux);
}
</style>
