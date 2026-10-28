<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from '@adonisjs/inertia/vue'
import ModaleChoix from '~/components/modale_choix.vue'
import type { ChampFiche, QuestionFront } from '~/question'

const props = defineProps<{
  categorie: string
  question: QuestionFront
}>()

const LIBELLES: Record<ChampFiche, string> = {
  visuel: 'Visuel',
  nom: 'Nom du badge',
  champion: 'Champion',
  ville: 'Ville',
  type: 'Type',
}

const router = useRouter()
const envoi = ref(false)

// Les choix en cours, une valeur par info à trouver
const choix = ref<Partial<Record<ChampFiche, string>>>({})

// L'info dont la liste est ouverte dans la modale
const ouvert = ref<ChampFiche | null>(null)

// Nouvelle fiche (après chaque réponse) : on repart de cases vides
watch(
  () => props.question.fiche,
  () => {
    choix.value = {}
    ouvert.value = null
  }
)

const fiche = computed(() => props.question.fiche!)

// Une barre de segments tant que l'objectif reste raisonnable, sinon le compteur seul suffit
const segments = computed(() => {
  if (fiche.value.objectif > 20) return []
  return Array.from({ length: fiche.value.objectif }, (_, i) => i < fiche.value.compteur)
})

const complet = computed(() => fiche.value.champs.every((champ) => choix.value[champ]))

// L'image choisie pour le visuel (la valeur envoyée est le chemin, on affiche l'URL)
const visuelChoisi = computed(
  () => fiche.value.options.visuel.find((o) => o.valeur === choix.value.visuel)?.url ?? null
)

// La liste de textes de la modale (le visuel, lui, s'affiche en grille d'images)
const listeOuverte = computed(() =>
  ouvert.value && ouvert.value !== 'visuel' ? fiche.value.options[ouvert.value] : []
)

function choisir(champ: ChampFiche, valeur: string) {
  choix.value = { ...choix.value, [champ]: valeur }
  ouvert.value = null
}

function valider() {
  if (!complet.value) return
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
  <div v-if="question.fiche" class="fiche">
    <p class="enonce">{{ question.question }}</p>

    <div class="score">
      <span class="score__compteur">{{ fiche.compteur }} / {{ fiche.objectif }}</span>
      <div v-if="segments.length" class="segments">
        <div
          v-for="(plein, index) in segments"
          :key="index"
          class="segment score__segment"
          :class="{ 'segment--plein': plein }"
        />
      </div>
    </div>

    <div class="cadre cadre--allume depart">
      <span class="pixel depart__libelle">{{ LIBELLES[fiche.pivot.champ].toUpperCase() }}</span>
      <img v-if="fiche.pivot.image" :src="fiche.pivot.image" alt="" class="depart__image" />
      <span v-else class="depart__texte">{{ fiche.pivot.texte }}</span>
    </div>

    <div class="cases">
      <button
        v-for="champ in fiche.champs"
        :key="champ"
        type="button"
        class="cadre case"
        :class="{ 'case--remplie': choix[champ] }"
        :disabled="envoi"
        @click="ouvert = champ"
      >
        <span class="pixel case__libelle">{{ LIBELLES[champ].toUpperCase() }}</span>
        <img
          v-if="champ === 'visuel' && visuelChoisi"
          :src="visuelChoisi"
          alt=""
          class="case__image"
        />
        <span v-else-if="choix[champ]" class="case__valeur">{{ choix[champ] }}</span>
        <span v-else class="case__vide">Choisir…</span>
      </button>
    </div>

    <button type="button" class="bouton" :disabled="!complet || envoi" @click="valider">
      VALIDER
    </button>

    <div
      v-if="fiche.derniere"
      class="cadre correction"
      :class="fiche.derniere.correct ? 'correction--juste' : 'correction--faux'"
    >
      <span class="pixel correction__titre">
        FICHE PRECEDENTE : {{ fiche.derniere.correct ? 'JUSTE' : 'FAUSSE' }}
      </span>
      <div class="correction__contenu">
        <img :src="fiche.derniere.image" alt="" class="correction__image" />
        <dl class="correction__infos">
          <dt>Badge</dt>
          <dd>{{ fiche.derniere.nom }}</dd>
          <dt>Champion</dt>
          <dd>{{ fiche.derniere.champions }}</dd>
          <dt>Ville</dt>
          <dd>{{ fiche.derniere.villes }}</dd>
          <dt>Type</dt>
          <dd>{{ fiche.derniere.types }}</dd>
        </dl>
      </div>
    </div>

    <ModaleChoix
      v-if="ouvert"
      :titre="LIBELLES[ouvert]"
      :valeurs="ouvert === 'visuel' ? undefined : listeOuverte"
      :images="ouvert === 'visuel' ? fiche.options.visuel : undefined"
      :choisie="choix[ouvert]"
      @choisir="(valeur) => ouvert && choisir(ouvert, valeur)"
      @fermer="ouvert = null"
    />
  </div>
</template>

<style scoped>
.fiche {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.score__compteur {
  font-family: var(--police-pixel);
  font-size: 22px;
  color: var(--accent);
  text-shadow: 0 0 12px var(--accent-halo);
}

.score__segment {
  width: 12px;
  height: 14px;
}

.depart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 18px 16px;
}

.depart__libelle {
  color: var(--accent);
}

.depart__image {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.depart__texte {
  font-size: 22px;
  font-weight: 700;
  text-align: center;
}

.cases {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
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
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

.case__vide {
  font-size: 15px;
  color: var(--texte-doux);
}

.case__image {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.correction {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.correction--juste {
  --cadre: var(--juste);
}

.correction--faux {
  --cadre: var(--faux);
}

.correction--juste .correction__titre {
  color: var(--juste);
}

.correction--faux .correction__titre {
  color: var(--faux);
}

.correction__contenu {
  display: flex;
  align-items: center;
  gap: 14px;
}

.correction__image {
  flex: none;
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.correction__infos {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 4px 10px;
  margin: 0;
  font-size: 14px;
}

.correction__infos dt {
  color: var(--texte-doux);
}

.correction__infos dd {
  margin: 0;
}
</style>
