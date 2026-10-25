<script setup lang="ts">
import type { LigneSerie } from '~/question'

defineProps<{
  lignes: LigneSerie[]
}>()
</script>

<template>
  <div class="historique">
    <span class="pixel doux">HISTORIQUE</span>

    <div class="historique__liste">
      <div
        v-for="(ligne, index) in lignes"
        :key="lignes.length - index"
        class="ligne"
        :class="ligne.correct ? 'ligne--juste' : 'ligne--faux'"
      >
        <div class="cote">
          <img :src="ligne.a.image" alt="" class="cote__image" />
          <span
            ><strong>{{ ligne.a.nom }}</strong
            ><br />{{ ligne.a.valeur }}</span
          >
        </div>
        <span class="signe">{{ ligne.signe }}</span>
        <div class="cote cote--droite">
          <span
            ><strong>{{ ligne.b.nom }}</strong
            ><br />{{ ligne.b.valeur }}</span
          >
          <img :src="ligne.b.image" alt="" class="cote__image" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.historique {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.historique__liste {
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ligne {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32px minmax(0, 1fr);
  align-items: center;
  padding: 8px 10px;
  font-size: 13px;
  line-height: 1.3;
}

.ligne--juste {
  background: rgba(77, 255, 154, 0.12);
  border-left: 4px solid var(--juste);
}

.ligne--faux {
  background: rgba(255, 90, 110, 0.12);
  border-left: 4px solid var(--faux);
}

.cote {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.cote--droite {
  justify-content: flex-end;
  text-align: right;
}

.cote__image {
  flex: none;
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.signe {
  font-family: var(--police-pixel);
  font-size: 12px;
  text-align: center;
}

.ligne--juste .signe {
  color: var(--juste);
}

.ligne--faux .signe {
  color: var(--faux);
}
</style>
