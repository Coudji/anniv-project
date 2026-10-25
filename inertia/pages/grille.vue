<script setup lang="ts">
import { computed } from 'vue'
import { Link, useRouter } from '@adonisjs/inertia/vue'
import PixelIcone from '~/components/pixel_icone.vue'
import { enPixel, varsTheme, type ThemeFront } from '../theme'

const props = defineProps<{
  pseudo: string
  cases: {
    id: string
    nom: string
    theme: ThemeFront
    faites: number
    total: number
    terminee: boolean
    verrouillee: boolean
  }[]
}>()

const router = useRouter()

// Les 8 catégories autour du central
const exterieures = computed(() => props.cases.filter((c) => c.id !== 'cat9'))
const nbTerminees = computed(() => exterieures.value.filter((c) => c.terminee).length)
const centralVerrouille = computed(() => props.cases.some((c) => c.verrouillee))

function reinitialiser() {
  if (window.confirm('Tout recommencer ? Toute ta progression sera perdue.')) {
    router.post({ route: 'players.reset' })
  }
}
</script>

<template>
  <main class="ecran">
    <div class="entete">
      <span class="pixel doux">JOUEUR 1</span>
      <span class="pixel pseudo">{{ enPixel(pseudo) }}</span>
    </div>

    <div class="tete">
      <h1 class="titre">CHOISIS TON DEFI</h1>
      <div class="progression">
        <div class="segments">
          <div
            v-for="(c, index) in exterieures"
            :key="c.id"
            class="segment"
            :class="{ 'segment--plein': index < nbTerminees }"
          />
        </div>
        <span class="pixel doux">{{ nbTerminees }} / {{ exterieures.length }}</span>
      </div>
    </div>

    <div class="grille">
      <template v-for="c in cases" :key="c.id">
        <div
          v-if="c.verrouillee"
          class="case cadre case--verrouillee"
          :aria-label="`${c.nom} : verrouillé`"
        >
          <PixelIcone nom="cadenas" />
          <span class="case__nom">{{ c.nom }}</span>
          <span class="pixel case__etat">VERROUILLE</span>
        </div>

        <div
          v-else-if="c.terminee"
          class="case cadre cadre--allume"
          :style="varsTheme(c.theme.couleur)"
        >
          <PixelIcone :nom="c.theme.icone" />
          <span class="case__nom">{{ c.nom }}</span>
          <span class="pixel case__etat">TERMINE</span>
        </div>

        <Link
          v-else
          route="categories.show"
          :params="{ id: c.id }"
          class="case cadre case--jouable"
          :style="varsTheme(c.theme.couleur)"
        >
          <PixelIcone :nom="c.theme.icone" />
          <span class="case__nom">{{ c.nom }}</span>
          <span class="pixel case__etat doux">{{ c.faites }} / {{ c.total }}</span>
        </Link>
      </template>
    </div>

    <p v-if="centralVerrouille" class="doux">
      Termine les {{ exterieures.length }} défis pour débloquer l'épreuve finale.
    </p>

    <div class="pied">
      <button type="button" class="bouton bouton--secondaire" @click="reinitialiser">
        TOUT RECOMMENCER
      </button>
    </div>
  </main>
</template>

<style scoped>
.pseudo {
  color: var(--accent);
}

.tete {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.progression {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progression .segment--plein {
  background: var(--juste);
}

.grille {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  padding: 4px;
}

.case {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px;
  text-align: center;
  color: var(--accent);
  text-decoration: none;
}

.case__nom {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--texte);
}

.case__etat {
  font-size: 8px;
}

.case--jouable {
  transition:
    background 0.15s,
    box-shadow 0.15s;
}

.case--jouable:hover {
  background: var(--accent-fond);
  box-shadow:
    0 -4px 0 0 var(--accent),
    0 4px 0 0 var(--accent),
    -4px 0 0 0 var(--accent),
    4px 0 0 0 var(--accent);
}

.case--verrouillee {
  --cadre: var(--verrou);
  color: #8a84b8;
  background: var(--panneau-sombre);
}

.case--verrouillee .case__nom {
  color: var(--texte-doux);
}

.pied {
  margin-top: auto;
  display: flex;
  justify-content: center;
}
</style>
