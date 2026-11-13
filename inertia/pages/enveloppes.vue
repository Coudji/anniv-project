<script setup lang="ts">
/**
 * Les réponses de Kékiveu à imprimer (mode triche) : une carte par question,
 * à découper le long des pointillés et à glisser dans les enveloppes.
 */
defineProps<{
  cartes: { numero: number; titre: string; question: string; reponse: string }[]
}>()

function imprimer() {
  window.print()
}
</script>

<template>
  <main class="feuille">
    <div class="outils">
      <a href="/grille" class="retour">◀ Grille</a>
      <button type="button" class="imprimer" @click="imprimer">Imprimer</button>
    </div>

    <h1 class="titre">Réponses des enveloppes</h1>

    <div class="cartes">
      <article v-for="carte in cartes" :key="carte.numero" class="carte">
        <p class="carte__qui">
          <span class="carte__numero">{{ carte.numero }}</span>
          {{ carte.titre }}
        </p>
        <p class="carte__question">{{ carte.question }}</p>
        <p class="carte__reponse">{{ carte.reponse }}</p>
      </article>
    </div>
  </main>
</template>

<style scoped>
.feuille {
  max-width: 820px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  background: #fff;
  color: #111;
  font-family: system-ui, sans-serif;
}

.outils {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.retour {
  color: #333;
}

.imprimer {
  padding: 10px 22px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.titre {
  margin: 0 0 16px;
  font-family: system-ui, sans-serif;
  font-size: 22px;
  color: #111;
  text-shadow: none;
  letter-spacing: normal;
}

.cartes {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

/* Pointillés partagés entre cartes voisines : un seul coup de ciseaux par trait */
.carte {
  min-height: 60mm;
  padding: 7mm 6mm;
  border: 1px dashed #777;
  margin: 0 -1px -1px 0;
  display: flex;
  flex-direction: column;
  gap: 3mm;
  break-inside: avoid;
}

.carte__qui {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #555;
}

.carte__numero {
  display: inline-block;
  min-width: 22px;
  margin-right: 6px;
  padding: 1px 6px;
  border: 1.5px solid #111;
  border-radius: 4px;
  color: #111;
  text-align: center;
}

.carte__question {
  margin: 0;
  font-size: 13px;
  color: #444;
}

.carte__reponse {
  margin: auto 0 0;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
}
</style>

<style>
/* Impression : page blanche, sans le fond ni l'effet écran du site */
@media print {
  @page {
    size: A4;
    margin: 10mm;
  }

  html,
  body {
    background: #fff !important;
  }

  body::before,
  body::after {
    display: none !important;
  }

  .outils {
    display: none !important;
  }

  .feuille {
    padding: 0 !important;
    max-width: none !important;
  }
}
</style>
