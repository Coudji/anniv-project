<script setup lang="ts">
import { usePage } from '@inertiajs/vue3'
import { useRouter } from '@adonisjs/inertia/vue'

/**
 * Barre d'actions du mode triche, visible seulement quand il est activé.
 * Sur une catégorie : passer la question ou terminer la catégorie.
 * Sur la grille : tout terminer, ou tout sauf le central.
 */
const props = defineProps<{ categorie?: string }>()

const page = usePage()
const router = useRouter()

function passer() {
  if (props.categorie && window.confirm('Passer cette question ?')) {
    router.post({ route: 'triche.passer', routeParams: { id: props.categorie } })
  }
}

function terminer() {
  if (props.categorie && window.confirm('Terminer toute la catégorie ?')) {
    router.post({ route: 'triche.terminer', routeParams: { id: props.categorie } })
  }
}

function tout(saufCentral: boolean) {
  const message = saufCentral ? 'Terminer les 8 catégories (sauf le central) ?' : 'Tout terminer ?'
  if (window.confirm(message)) {
    router.post({ route: 'triche.tout' }, saufCentral ? { sauf: 'central' } : {})
  }
}

function quitter() {
  router.visit({ route: 'triche.desactiver' })
}
</script>

<template>
  <div v-if="page.props.triche" class="triche">
    <span class="pixel triche__titre">MODE TRICHE</span>
    <template v-if="categorie">
      <button type="button" class="triche__bouton" @click="passer">PASSER LA QUESTION</button>
      <button type="button" class="triche__bouton" @click="terminer">TERMINER LA CATEGORIE</button>
    </template>
    <template v-else>
      <button type="button" class="triche__bouton" @click="tout(true)">TOUT SAUF LE CENTRAL</button>
      <button type="button" class="triche__bouton" @click="tout(false)">TOUT TERMINER</button>
    </template>
    <button type="button" class="triche__bouton triche__bouton--quitter" @click="quitter">
      QUITTER
    </button>
  </div>
</template>

<style scoped>
.triche {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 2px dashed var(--faux);
  background: rgba(255, 90, 110, 0.08);
}

.triche__titre {
  color: var(--faux);
  margin-right: auto;
}

.triche__bouton {
  min-height: 36px;
  padding: 0 10px;
  font-family: var(--police-pixel);
  font-size: 8px;
  color: var(--texte);
  background: transparent;
  border: 2px solid var(--faux);
}

.triche__bouton:hover {
  background: rgba(255, 90, 110, 0.2);
}

.triche__bouton--quitter {
  border-color: var(--verrou);
  color: var(--texte-doux);
}
</style>
