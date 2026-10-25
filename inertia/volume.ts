import { ref, watch } from 'vue'

/**
 * Volume partagé par tous les lecteurs audio, mémorisé dans le navigateur
 * pour qu'il ne soit pas à régler à chaque extrait
 */
const CLE = 'volume'

function lire() {
  try {
    const valeur = Number(localStorage.getItem(CLE))
    return localStorage.getItem(CLE) !== null && valeur >= 0 && valeur <= 1 ? valeur : 0.8
  } catch {
    return 0.8
  }
}

export const volume = ref(typeof window === 'undefined' ? 0.8 : lire())
export const muet = ref(false)

watch(volume, (valeur) => {
  try {
    localStorage.setItem(CLE, String(valeur))
  } catch {
    // Stockage indisponible (navigation privée stricte) : le volume ne sera simplement pas mémorisé
  }
})
