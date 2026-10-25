<script setup lang="ts">
import type { LigneSerie } from '~/question'

defineProps<{
  lignes: LigneSerie[]
}>()
</script>

<template>
  <div class="historique">
    <table>
      <tr
        v-for="(ligne, index) in lignes"
        :key="lignes.length - index"
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
</template>

<style scoped>
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
