<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useRouter } from '@adonisjs/inertia/vue'
import type { QuestionFront } from '~/question'

const props = defineProps<{
  categorie: string
  question: QuestionFront
}>()

const router = useRouter()
const envoi = ref(false)
const saisie = ref('')
const champ = ref<HTMLInputElement | null>(null)

// Nouveau Pokémon : on vide le champ et on y remet le curseur
watch(
  () => props.question.ombre?.image,
  async () => {
    saisie.value = ''
    await nextTick()
    champ.value?.focus()
  }
)

function valider() {
  if (!saisie.value.trim() || envoi.value) return
  router.post(
    { route: 'categories.repondre', routeParams: { id: props.categorie } },
    { reponse: saisie.value },
    {
      preserveScroll: true,
      onStart: () => (envoi.value = true),
      onFinish: () => (envoi.value = false),
    }
  )
}
</script>

<template>
  <div v-if="question.ombre" class="ombre">
    <p class="enonce">{{ question.question }}</p>

    <p class="pixel compteur">{{ question.ombre.compteur }} / {{ question.ombre.objectif }}</p>

    <div class="cadre scene">
      <img :key="question.ombre.image" :src="question.ombre.image" alt="" class="silhouette" />
    </div>

    <form class="formulaire" @submit.prevent="valider">
      <label for="reponse" class="etiquette">C'EST…</label>
      <input
        id="reponse"
        ref="champ"
        v-model="saisie"
        type="text"
        autocomplete="off"
        autofocus
        class="champ"
        placeholder="Nom du Pokémon…"
      />
      <button type="submit" class="bouton" :disabled="!saisie.trim() || envoi">VALIDER</button>
    </form>

    <div
      v-if="question.ombre.derniere"
      class="cadre derniere"
      :class="question.ombre.derniere.correct ? 'derniere--juste' : 'derniere--faux'"
    >
      <img :src="question.ombre.derniere.image" alt="" class="derniere__image" />
      <p class="derniere__texte">
        {{ question.ombre.derniere.correct ? 'Bien vu,' : "Raté, c'était" }}
        <strong>{{ question.ombre.derniere.nom }}</strong>
        {{ question.ombre.derniere.correct ? '!' : '' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.ombre {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.compteur {
  margin: 0;
  text-align: center;
  font-size: 18px;
  color: var(--accent);
}

/* Fond clair façon "Quel est ce Pokémon ?" : la silhouette noire doit ressortir */
.scene {
  --cadre: var(--accent);
  display: flex;
  justify-content: center;
  padding: 16px;
  background: radial-gradient(circle, #fff6c9 0%, #9fd3ff 70%, #5aa7e8 100%);
}

.silhouette {
  width: 100%;
  max-width: 320px;
  aspect-ratio: 1;
  object-fit: contain;
  filter: brightness(0);
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

.derniere {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
}

.derniere--juste {
  --cadre: #3ddc84;
}

.derniere--faux {
  --cadre: #ff5c5c;
}

.derniere__image {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.derniere__texte {
  margin: 0;
  font-size: 16px;
}
</style>
