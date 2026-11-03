/**
 * Reprise de lecture entre deux écrans : quand un lecteur disparaît en pleine
 * lecture (bonne réponse), on retient où il en était. Le lecteur du même média
 * sur l'écran de résultat reprend au même endroit, au lieu de couper la musique.
 */
type Reprise = { url: string; temps: number; quand: number }

let enAttente: Reprise | null = null

// Au-delà, la reprise est oubliée (on n'est plus dans l'enchaînement question → résultat)
const DELAI = 10_000

export function retenirReprise(url: string, temps: number) {
  enAttente = { url, temps, quand: Date.now() }
}

/**
 * Renvoie l'instant où reprendre ce média, ou null. La reprise ne sert qu'une fois.
 */
export function prendreReprise(url: string): number | null {
  const reprise = enAttente
  if (!reprise || reprise.url !== url || Date.now() - reprise.quand > DELAI) return null
  enAttente = null
  return reprise.temps
}
