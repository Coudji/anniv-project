<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Confettis pixel qui jaillissent depuis le pourtour d'un élément (la carte)
 */
const props = defineProps<{ source: HTMLElement | null }>()

const toile = ref<HTMLCanvasElement | null>(null)

type Confetti = {
  x: number
  y: number
  vx: number
  vy: number
  taille: number
  angle: number
  rotation: number
  couleur: string
  vie: number
}

const COULEURS = ['#ffd84a', '#3ee8f0', '#ff4fb4', '#4dff9a', '#ff8f3d', '#b07cff', '#ffffff']

let confettis: Confetti[] = []
let boucle = 0
const minuteurs: number[] = []

/**
 * Lance une salve : chaque confetti part d'un point au hasard sur le bord
 * de la carte, vers l'extérieur
 */
function salve(nombre: number) {
  if (!props.source) return
  const r = props.source.getBoundingClientRect()

  for (let i = 0; i < nombre; i++) {
    const cote = Math.floor(Math.random() * 4)
    const t = Math.random()
    let x = r.left + t * r.width
    let y = r.top + t * r.height
    let nx = 0
    let ny = 0

    if (cote === 0) {
      y = r.top
      ny = -1
    } else if (cote === 1) {
      x = r.right
      nx = 1
    } else if (cote === 2) {
      y = r.bottom
      ny = 1
    } else {
      x = r.left
      nx = -1
    }

    const vitesse = 4 + Math.random() * 9
    confettis.push({
      x,
      y,
      vx: nx * vitesse + (Math.random() - 0.5) * 4,
      vy: ny * vitesse + (Math.random() - 0.5) * 4 - 4,
      taille: 5 + Math.random() * 6,
      angle: Math.random() * Math.PI,
      rotation: (Math.random() - 0.5) * 0.3,
      couleur: COULEURS[Math.floor(Math.random() * COULEURS.length)],
      vie: 1,
    })
  }

  if (!boucle) boucle = requestAnimationFrame(animer)
}

function animer() {
  const canvas = toile.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const ratio = window.devicePixelRatio || 1

  confettis = confettis.filter((c) => c.vie > 0 && c.y < window.innerHeight + 40)
  for (const c of confettis) {
    c.vx *= 0.985
    c.vy = c.vy * 0.985 + 0.22
    c.x += c.vx
    c.y += c.vy
    c.angle += c.rotation
    c.vie -= 0.004

    ctx.save()
    ctx.globalAlpha = Math.min(c.vie * 2, 1)
    ctx.translate(c.x * ratio, c.y * ratio)
    ctx.rotate(c.angle)
    ctx.fillStyle = c.couleur
    // Un confetti carré "pixel" qui semble tourner sur lui-même
    const largeur = c.taille * ratio
    ctx.fillRect(
      -largeur / 2,
      (-largeur / 2) * Math.abs(Math.cos(c.angle * 3)),
      largeur,
      largeur * Math.abs(Math.cos(c.angle * 3))
    )
    ctx.restore()
  }

  boucle = confettis.length ? requestAnimationFrame(animer) : 0
}

function redimensionner() {
  if (!toile.value) return
  const ratio = window.devicePixelRatio || 1
  toile.value.width = window.innerWidth * ratio
  toile.value.height = window.innerHeight * ratio
}

onMounted(() => {
  redimensionner()
  window.addEventListener('resize', redimensionner)
  salve(160)
  minuteurs.push(window.setTimeout(() => salve(120), 700))
  minuteurs.push(window.setTimeout(() => salve(90), 1600))
})

onUnmounted(() => {
  cancelAnimationFrame(boucle)
  minuteurs.forEach((m) => clearTimeout(m))
  window.removeEventListener('resize', redimensionner)
})
</script>

<template>
  <canvas ref="toile" class="confettis" aria-hidden="true" />
</template>

<style scoped>
.confettis {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 50;
  pointer-events: none;
}
</style>
