<script setup lang="ts">
import { Form } from '@adonisjs/inertia/vue'
</script>

<template>
  <div>
    <h1>Bienvenue</h1>

    <Form v-slot="{ errors, processing }" route="players.store">
      <label for="pseudo">Ton pseudo</label>
      <input id="pseudo" name="pseudo" type="text" autocomplete="off" />
      <p v-if="errors.pseudo">{{ errors.pseudo }}</p>

      <button type="submit" :disabled="processing">Jouer</button>
    </Form>
  </div>
</template>
