<script setup lang="ts">
import { Link } from '@adonisjs/inertia/vue'

defineProps<{
  pseudo: string
  cases: {
    id: string
    nom: string
    faites: number
    total: number
    terminee: boolean
    verrouillee: boolean
  }[]
}>()
</script>

<template>
  <div>
    <h1>Grille de {{ pseudo }}</h1>

    <div class="grille">
      <div v-for="c in cases" :key="c.id" class="case">
        <strong>{{ c.nom }}</strong>
        <span v-if="c.verrouillee">Verrouillée</span>
        <span v-else-if="c.terminee">Terminée</span>
        <span v-else>{{ c.faites }} / {{ c.total }}</span>
        <Link v-if="!c.verrouillee && !c.terminee" route="categories.show" :params="{ id: c.id }">
          Jouer
        </Link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grille {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-width: 480px;
}

.case {
  border: 1px solid;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
