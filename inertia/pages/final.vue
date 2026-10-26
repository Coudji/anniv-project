<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from '@adonisjs/inertia/vue'
import Confettis from '~/components/confettis.vue'
import PixelIcone from '~/components/pixel_icone.vue'
import { varsTheme, type ThemeFront } from '../theme'

const props = defineProps<{
  cases: { id: string; nom: string; theme: ThemeFront }[]
  dos: string
  face: string
}>()

/**
 * Les étapes du final :
 * intro (la grille terminée) → transition (les cases deviennent des emplacements)
 * → puzzle → assemblage (les morceaux se rejoignent) → carte (de dos, à retourner)
 * → retournement → revele (la carte, les confettis, le gâteau)
 */
type Phase = 'intro' | 'transition' | 'puzzle' | 'assemblage' | 'carte' | 'retournement' | 'revele'
const phase = ref<Phase>('intro')

const router = useRouter()
const carte = ref<HTMLElement | null>(null)
const minuteurs: number[] = []

function plusTard(action: () => void, delai: number) {
  minuteurs.push(window.setTimeout(action, delai))
}

/* ------------------------------------------------------------------------
 * Le puzzle : 9 morceaux numérotés de 0 à 8 (ligne par ligne).
 * emplacements[i] = morceau posé dans la case i, null si elle est vide.
 * rotations[n] = nombre de quarts de tour du morceau n (0 = bon sens).
 * ---------------------------------------------------------------------- */
function melanger<T>(liste: T[]) {
  const copie = [...liste]
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

const emplacements = ref<(number | null)[]>(Array.from({ length: 9 }, () => null))
const reserve = ref<number[]>(melanger([0, 1, 2, 3, 4, 5, 6, 7, 8]))
const rotations = ref<number[]>(Array.from({ length: 9 }, () => Math.floor(Math.random() * 4)))

const cases = computed(() =>
  props.cases.map((c, i) => ({ ...c, index: i, morceau: emplacements.value[i] }))
)

/**
 * Un morceau = la bonne portion de l'image du dos. Tourné d'un quart de tour,
 * il est réduit pour tenir dans sa case (les morceaux ne sont pas carrés).
 */
const RATIO = 63 / 88

function styleMorceau(n: number, echelle = 1) {
  const quarts = rotations.value[n]
  const reduction = quarts % 2 === 1 ? RATIO : 1
  return {
    backgroundImage: `url(${props.dos})`,
    backgroundPosition: `${(n % 3) * 50}% ${Math.floor(n / 3) * 50}%`,
    transform: `rotate(${quarts * 90}deg) scale(${reduction * echelle})`,
  }
}

function verifier() {
  const resolu = emplacements.value.every((n, i) => n === i && rotations.value[i] === 0)
  if (!resolu) return

  phase.value = 'assemblage'
  plusTard(() => (phase.value = 'carte'), 1400)
}

function tourner(n: number) {
  rotations.value[n] = (rotations.value[n] + 1) % 4
  verifier()
}

/**
 * Déplace un morceau vers une case (en échangeant avec l'occupant s'il y en a un)
 * ou vers la réserve
 */
function deplacer(n: number, cible: string) {
  const origine = emplacements.value.indexOf(n)

  if (cible === 'reserve') {
    if (origine >= 0) {
      emplacements.value[origine] = null
      reserve.value.push(n)
    }
    return
  }

  const destination = Number(cible)
  if (destination === origine) return

  const occupant = emplacements.value[destination]
  if (origine >= 0) {
    emplacements.value[origine] = occupant
  } else {
    reserve.value.splice(reserve.value.indexOf(n), 1)
    if (occupant !== null) reserve.value.push(occupant)
  }
  emplacements.value[destination] = n
  verifier()
}

/* ------------------------------------------------------------------------
 * Glisser-déposer (souris et doigt) : un appui sans bouger tourne le morceau,
 * un glissement le déplace
 * ---------------------------------------------------------------------- */
const glisse = ref<{ n: number; x: number; y: number } | null>(null)
let depart: { n: number; x: number; y: number } | null = null

function debut(event: PointerEvent, n: number) {
  if (phase.value !== 'puzzle') return
  depart = { n, x: event.clientX, y: event.clientY }
  window.addEventListener('pointermove', bouger)
  window.addEventListener('pointerup', fin, { once: true })
  window.addEventListener('pointercancel', annuler, { once: true })
}

function bouger(event: PointerEvent) {
  if (!depart) return
  const distance = Math.hypot(event.clientX - depart.x, event.clientY - depart.y)
  if (!glisse.value && distance < 8) return
  glisse.value = { n: depart.n, x: event.clientX, y: event.clientY }
}

function fin(event: PointerEvent) {
  window.removeEventListener('pointermove', bouger)
  window.removeEventListener('pointercancel', annuler)
  if (!depart) return

  const n = depart.n
  depart = null

  if (!glisse.value) {
    tourner(n)
    return
  }

  glisse.value = null
  const cible = document
    .elementFromPoint(event.clientX, event.clientY)
    ?.closest<HTMLElement>('[data-cible]')
  if (cible?.dataset.cible) deplacer(n, cible.dataset.cible)
}

function annuler() {
  window.removeEventListener('pointermove', bouger)
  depart = null
  glisse.value = null
}

/* ------------------------------------------------------------------------
 * La carte
 * ---------------------------------------------------------------------- */
function retourner() {
  if (phase.value === 'carte') phase.value = 'retournement'
}

function finRetournement() {
  phase.value = 'revele'
}

function reinitialiser() {
  if (window.confirm('Tout recommencer ? Toute ta progression sera perdue.')) {
    router.post({ route: 'players.reset' })
  }
}

const titre = computed(() => {
  if (phase.value === 'intro') return 'TOUS LES DEFIS SONT TERMINES !'
  if (['transition', 'puzzle', 'assemblage'].includes(phase.value)) return 'RECONSTITUE LA CARTE'
  return ''
})

onMounted(() => {
  plusTard(() => (phase.value = 'transition'), 2200)
  plusTard(() => (phase.value = 'puzzle'), 3200)
})

onUnmounted(() => {
  minuteurs.forEach((m) => clearTimeout(m))
  annuler()
})
</script>

<template>
  <main class="final" :class="`final--${phase}`">
    <!-- Le titre garde sa place même vide, pour que la carte ne saute pas -->
    <h1 class="titre final__titre" :class="{ 'final__titre--vide': !titre }">{{ titre || '.' }}</h1>

    <div class="scene">
      <div class="zone-carte">
        <div v-if="phase === 'revele'" class="rayons" aria-hidden="true" />

        <!-- La grille, qui devient le plateau du puzzle -->
        <div v-if="['intro', 'transition', 'puzzle', 'assemblage'].includes(phase)" class="plateau">
          <div
            v-for="c in cases"
            :key="c.id"
            class="emplacement"
            :data-cible="c.index"
            :style="varsTheme(c.theme.couleur)"
          >
            <div class="emplacement__case">
              <PixelIcone :nom="c.theme.icone" :taille="24" />
              <span class="emplacement__nom">{{ c.nom }}</span>
            </div>
            <div
              v-if="c.morceau !== null"
              class="morceau"
              :class="{ 'morceau--fantome': glisse?.n === c.morceau }"
              :style="styleMorceau(c.morceau)"
              @pointerdown.prevent="debut($event, c.morceau)"
            />
          </div>
        </div>

        <!-- La carte reconstituée -->
        <button
          v-else
          ref="carte"
          type="button"
          class="carte"
          :class="{ 'carte--retournee': phase === 'retournement' || phase === 'revele' }"
          :disabled="phase !== 'carte'"
          aria-label="Retourner la carte"
          @click="retourner"
        >
          <div class="carte__interieur" @animationend="finRetournement">
            <img :src="dos" alt="" class="carte__face" />
            <img :src="face" alt="" class="carte__face carte__avant" />
          </div>
        </button>
      </div>

      <!-- Les morceaux pas encore posés -->
      <div v-if="phase === 'transition' || phase === 'puzzle'" class="reserve" data-cible="reserve">
        <div v-for="n in reserve" :key="n" class="reserve__case">
          <div
            class="morceau"
            :class="{ 'morceau--fantome': glisse?.n === n }"
            :style="styleMorceau(n, 0.7)"
            @pointerdown.prevent="debut($event, n)"
          />
        </div>
      </div>
    </div>

    <p v-if="phase === 'puzzle'" class="consigne">
      Glisse les morceaux sur la grille. Touche un morceau pour le faire tourner.
    </p>
    <p v-if="phase === 'carte'" class="consigne consigne--clignote">
      Touche la carte pour la retourner…
    </p>

    <div v-if="phase === 'revele'" class="fete">
      <h1 class="titre fete__titre">JOYEUX ANNIVERSAIRE !</h1>
      <PixelIcone nom="gateau" :taille="88" class="fete__gateau" />
      <button type="button" class="bouton bouton--secondaire fete__reset" @click="reinitialiser">
        TOUT RECOMMENCER
      </button>
    </div>

    <Confettis v-if="phase === 'revele'" :source="carte" />

    <!-- Le morceau en cours de déplacement suit le pointeur -->
    <div
      v-if="glisse"
      class="morceau morceau--glisse"
      :style="{ ...styleMorceau(glisse.n), left: `${glisse.x}px`, top: `${glisse.y}px` }"
    />
  </main>
</template>

<style scoped>
.final {
  /* Largeur de la carte, adaptée à l'écran ; hauteur au format d'une vraie carte */
  --l: min(330px, 76vw, 34vh);
  --h: calc(var(--l) * 88 / 63);
  --pw: calc(var(--l) / 3);
  --ph: calc(var(--h) / 3);

  min-height: 100vh;
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  overflow-x: hidden;
}

.final__titre {
  text-align: center;
  font-size: 18px;
  animation: apparition 0.5s ease-out;
}

.final__titre--vide {
  visibility: hidden;
}

.scene {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 32px;
}

.zone-carte {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---------------------------------------------------------------- plateau */

.plateau {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, var(--pw));
  grid-template-rows: repeat(3, var(--ph));
  gap: 12px;
  transition: gap 1s ease-in-out;
}

.final--assemblage .plateau {
  gap: 0;
}

.emplacement {
  position: relative;
  box-shadow:
    0 -3px 0 0 var(--accent),
    0 3px 0 0 var(--accent),
    -3px 0 0 0 var(--accent),
    3px 0 0 0 var(--accent),
    0 0 18px 2px var(--accent-halo);
  background: var(--accent-fond);
  transition:
    box-shadow 0.9s,
    background 0.9s;
}

/* Les cases s'éteignent et deviennent des emplacements vides */
.final--transition .emplacement,
.final--puzzle .emplacement {
  background: rgba(255, 255, 255, 0.03);
  box-shadow: inset 0 0 0 2px var(--accent-attenue);
}

.final--assemblage .emplacement {
  background: transparent;
  box-shadow: none;
}

.emplacement__case {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 4px;
  text-align: center;
  color: var(--accent);
  transition: opacity 0.7s;
}

.final:not(.final--intro) .emplacement__case {
  opacity: 0;
}

.emplacement__nom {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--texte);
}

/* ---------------------------------------------------------------- morceaux */

.morceau {
  position: absolute;
  inset: 0;
  background-size: 300% 300%;
  background-repeat: no-repeat;
  cursor: grab;
  touch-action: none;
  user-select: none;
  transition: transform 0.2s ease-out;
}

.morceau--fantome {
  opacity: 0.25;
}

.morceau--glisse {
  position: fixed;
  inset: auto;
  z-index: 100;
  width: var(--pw);
  height: var(--ph);
  margin: calc(var(--ph) / -2) 0 0 calc(var(--pw) / -2);
  pointer-events: none;
  cursor: grabbing;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.6));
  transition: none;
}

.final--assemblage .morceau {
  cursor: default;
}

.reserve {
  display: grid;
  grid-template-columns: repeat(3, calc(var(--ph) * 0.75));
  grid-auto-rows: calc(var(--ph) * 0.75);
  gap: 8px;
  min-height: calc(var(--ph) * 0.75);
  padding: 12px;
  background: var(--panneau-sombre);
  box-shadow: inset 0 0 0 2px var(--ligne);
  animation: apparition 0.8s ease-out;
}

.reserve__case {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reserve__case .morceau {
  inset: auto;
  width: var(--pw);
  height: var(--ph);
}

/* ---------------------------------------------------------------- carte */

.carte {
  position: relative;
  z-index: 1;
  width: var(--l);
  height: var(--h);
  padding: 0;
  border: none;
  background: none;
  perspective: 1400px;
  cursor: pointer;
}

.carte:disabled {
  cursor: default;
}

.final--carte .carte {
  animation: flotte 2.4s ease-in-out infinite;
}

.carte__interieur {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.carte--retournee .carte__interieur {
  animation: retourner 4s forwards;
}

.carte__face {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.carte__avant {
  transform: rotateY(180deg);
}

.final--revele .carte {
  filter: drop-shadow(0 0 28px rgba(255, 216, 74, 0.55));
}

/* Lentement d'abord (suspense), puis de plus en plus vite */
@keyframes retourner {
  0% {
    transform: rotateY(0);
  }
  15% {
    transform: rotateY(-12deg);
    animation-timing-function: linear;
  }
  65% {
    transform: rotateY(35deg);
    animation-timing-function: cubic-bezier(0.6, 0, 0.9, 0.7);
  }
  100% {
    transform: rotateY(180deg);
  }
}

@keyframes flotte {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* Rayons de lumière qui tournent derrière la carte */
.rayons {
  position: absolute;
  z-index: 0;
  left: 50%;
  top: 50%;
  width: calc(var(--h) * 2.4);
  height: calc(var(--h) * 2.4);
  margin: calc(var(--h) * -1.2) 0 0 calc(var(--h) * -1.2);
  background: repeating-conic-gradient(rgba(255, 216, 74, 0.3) 0deg 8deg, transparent 8deg 20deg);
  mask-image: radial-gradient(circle, #000 20%, transparent 68%);
  animation:
    tourne 30s linear infinite,
    apparition 1.2s ease-out;
  pointer-events: none;
}

@keyframes tourne {
  to {
    transform: rotate(360deg);
  }
}

/* ---------------------------------------------------------------- textes */

.consigne {
  max-width: 420px;
  text-align: center;
  color: var(--texte-doux);
}

.consigne--clignote {
  font-family: var(--police-pixel);
  font-size: 10px;
  color: var(--jaune);
  animation: clignote 1.2s steps(2) infinite;
}

@keyframes clignote {
  50% {
    opacity: 0.3;
  }
}

.fete {
  position: relative;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.fete__titre {
  text-align: center;
  font-size: clamp(18px, 5vw, 30px);
  animation: pop 0.7s cubic-bezier(0.3, 1.6, 0.5, 1) both;
}

.fete__gateau {
  color: var(--jaune);
  filter: drop-shadow(0 0 12px rgba(255, 216, 74, 0.6));
  animation:
    pop 0.7s 0.4s cubic-bezier(0.3, 1.6, 0.5, 1) both,
    saute 1.4s 1.2s ease-in-out infinite;
}

.fete__reset {
  margin-top: 24px;
  animation: apparition 1s 4s both;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.3);
  }
}

@keyframes saute {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes apparition {
  from {
    opacity: 0;
  }
}
</style>
