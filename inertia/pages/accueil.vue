<script setup lang="ts">
import { Form } from '@adonisjs/inertia/vue'
</script>

<template>
  <main class="ecran accueil">
    <h1 class="titre accueil__titre">BIENVENUE</h1>

    <Form v-slot="{ errors, processing }" route="players.store" class="formulaire">
      <label for="pseudo" class="etiquette">ENTRE TON PSEUDO</label>
      <input
        id="pseudo"
        name="pseudo"
        type="text"
        autocomplete="off"
        autofocus
        class="champ"
        placeholder="Ton pseudo…"
      />
      <p v-if="errors.pseudo" class="erreur">{{ errors.pseudo }}</p>

      <button type="submit" class="bouton" :disabled="processing">JOUER ▶</button>
    </Form>
  </main>
</template>

<style scoped>
.accueil {
  justify-content: center;
  gap: 40px;
}

.accueil__titre {
  text-align: center;
  font-size: 26px;
}
</style>
