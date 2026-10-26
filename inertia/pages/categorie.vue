<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Link } from '@adonisjs/inertia/vue'
import BarreTriche from '~/components/barre_triche.vue'
import FlashToasts from '~/components/flash_toasts.vue'
import HistoriqueSerie from '~/components/historique_serie.vue'
import MediaDisplay from '~/components/media_display.vue'
import PixelIcone from '~/components/pixel_icone.vue'
import QuestionRenderer from '~/components/question_renderer.vue'
import type { QuestionFront, ResolueFront, RetourFront } from '../question'
import { enPixel, varsTheme, type ThemeFront } from '../theme'

const props = defineProps<{
  id: string
  nom: string
  theme: ThemeFront
  numero: number
  total: number
  question: QuestionFront | null
  resultat: 'bonne' | 'terminee' | null
  retour: RetourFront | null
  resolue: ResolueFront | null
}>()

// L'écran de résultat reste affiché jusqu'au clic sur "Question suivante"
const afficherResolue = ref(props.resolue !== null)

watch(
  () => props.resolue,
  (resolue) => {
    afficherResolue.value = resolue !== null
  }
)

// Un segment par question : faites, en cours, à venir
const segments = computed(() =>
  Array.from({ length: props.total }, (_, i) =>
    i < props.numero - 1 ? 'plein' : i === props.numero - 1 ? 'en-cours' : 'vide'
  )
)
</script>

<template>
  <main class="ecran" :style="varsTheme(theme.couleur)">
    <div class="entete">
      <Link route="grille" class="lien-retour">◀ GRILLE</Link>
      <div class="categorie">
        <PixelIcone :nom="theme.icone" :taille="18" />
        <span class="pixel categorie__nom">{{ enPixel(nom) }}</span>
      </div>
    </div>

    <section v-if="resolue && (afficherResolue || !question)" class="bloc">
      <p class="enonce doux">{{ resolue.question }}</p>
      <MediaDisplay v-if="resolue.media" :media="resolue.media" />
      <HistoriqueSerie v-if="resolue.serie" :lignes="resolue.serie" />

      <div class="bravo">
        <PixelIcone nom="coche" :taille="44" class="bravo__icone" />
        <h1 class="titre bravo__titre">
          {{ resolue.serie ? 'SERIE REUSSIE !' : 'BONNE REPONSE !' }}
        </h1>
      </div>

      <div v-if="resolue.apres" class="cadre apres">
        <span class="pixel apres__titre">LE SAVAIS-TU ?</span>
        <p v-if="resolue.apres.texte" class="apres__texte">{{ resolue.apres.texte }}</p>
        <MediaDisplay v-for="(media, index) in resolue.apres.medias" :key="index" :media="media" />
      </div>

      <button v-if="question" type="button" class="bouton" @click="afficherResolue = false">
        QUESTION SUIVANTE ▶
      </button>
      <template v-else>
        <p class="pixel fin">CATEGORIE TERMINEE !</p>
        <Link route="grille" class="bouton bouton--lien">
          {{ id === 'cat9' ? 'LA SUITE ▶' : 'RETOUR A LA GRILLE' }}
        </Link>
      </template>
    </section>

    <section v-else-if="question" class="bloc">
      <div class="numero">
        <span class="pixel numero__texte">QUESTION {{ numero }} / {{ total }}</span>
        <div class="segments">
          <div
            v-for="(etat, index) in segments"
            :key="index"
            class="segment"
            :class="etat !== 'vide' && `segment--${etat}`"
          />
        </div>
      </div>

      <QuestionRenderer :key="numero" :categorie="id" :question="question" :retour="retour" />
    </section>

    <BarreTriche v-if="question && !afficherResolue" :categorie="id" class="barre-triche" />

    <FlashToasts />
  </main>
</template>

<style scoped>
.categorie {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent);
}

.categorie__nom {
  font-size: 10px;
}

.bloc {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.numero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.numero__texte {
  font-size: 11px;
  color: var(--accent);
}

.bravo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 8px 0;
}

.bravo__icone {
  color: var(--juste);
  filter: drop-shadow(0 0 8px rgba(77, 255, 154, 0.7));
}

.bravo__titre {
  text-align: center;
}

.apres {
  --cadre: #8a7426;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.apres__titre {
  color: var(--jaune);
}

.apres__texte {
  font-size: 16px;
  line-height: 1.55;
  white-space: pre-line;
}

.fin {
  text-align: center;
  font-size: 11px;
  color: var(--accent);
}

.bouton--lien {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}
.barre-triche {
  margin-top: auto;
}
</style>
