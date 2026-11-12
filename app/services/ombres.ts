import { readFile } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import type { Session } from '@adonisjs/session'
import type { QuestionOmbre } from '#services/content'
import { correspond } from '#services/mecaniques'

type Pokemon = { id: number; nom: string }

/**
 * État de la question en cours, gardé dans la session : le Pokémon à reconnaître,
 * le compteur et la réponse précédente ([id, juste ?]) pour afficher la correction.
 * `cle` identifie la question (catégorie + numéro) : si elle change, on repart de zéro.
 */
type EtatOmbre = {
  cle: string
  id: number
  compteur: number
  derniere: [id: number, correct: boolean] | null
}

const CLE_SESSION = 'ombre'
const MAX_PAR_DEFAUT = 251

let pokemons: Map<number, Pokemon> | null = null

async function chargerPokemons() {
  if (!pokemons) {
    const raw = await readFile(app.makePath('content/pokemon.json'), 'utf-8')
    const liste: Pokemon[] = JSON.parse(raw)
    pokemons = new Map(liste.map((p) => [p.id, p]))
  }
  return pokemons
}

export function imagePokemon(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

/**
 * Tire un Pokémon entre 1 et `max` (251 par défaut : les deux premières générations),
 * différent du précédent
 */
function tirer(question: QuestionOmbre, precedent?: number) {
  const max = question.max ?? MAX_PAR_DEFAUT
  let id = 1 + Math.floor(Math.random() * max)
  while (id === precedent) {
    id = 1 + Math.floor(Math.random() * max)
  }
  return id
}

/**
 * Récupère l'ombre en cours pour cette question, ou en tire une nouvelle
 */
export function etatOmbre(session: Session, cle: string, question: QuestionOmbre): EtatOmbre {
  const etat = session.get(CLE_SESSION) as EtatOmbre | undefined
  if (etat?.cle === cle) return etat

  const nouvel: EtatOmbre = { cle, id: tirer(question), compteur: 0, derniere: null }
  session.put(CLE_SESSION, nouvel)
  return nouvel
}

/**
 * Vérifie le nom tapé (même tolérance aux fautes que les autres questions) :
 * +1 si juste, -1 si faux (sans descendre sous 0), puis un nouveau Pokémon.
 * Renvoie l'id du dernier Pokémon trouvé quand l'objectif est atteint, null sinon.
 * `correct` est null si rien n'a été tapé.
 */
export async function repondreOmbre(
  session: Session,
  cle: string,
  question: QuestionOmbre,
  reponse: unknown
): Promise<{ correct: boolean | null; fini: number | null }> {
  const etat = etatOmbre(session, cle, question)
  if (typeof reponse !== 'string' || !reponse.trim()) return { correct: null, fini: null }

  const liste = await chargerPokemons()
  const correct = correspond(reponse, [liste.get(etat.id)!.nom])
  etat.compteur = correct ? etat.compteur + 1 : Math.max(0, etat.compteur - 1)

  if (etat.compteur >= question.objectif) {
    session.forget(CLE_SESSION)
    return { correct, fini: etat.id }
  }

  etat.derniere = [etat.id, correct]
  etat.id = tirer(question, etat.id)
  session.put(CLE_SESSION, etat)
  return { correct, fini: null }
}

/**
 * Abandonne la question en cours (en revenant à la grille, par exemple)
 */
export function oublierOmbre(session: Session) {
  session.forget(CLE_SESSION)
}

/**
 * Ce que le front affiche : l'image du Pokémon (noircie par le CSS), le compteur
 * et la correction de la réponse précédente. Le nom n'est jamais envoyé avant la réponse.
 */
export async function ombrePourFront(etat: EtatOmbre, question: QuestionOmbre) {
  const liste = await chargerPokemons()
  return {
    image: imagePokemon(etat.id),
    compteur: etat.compteur,
    objectif: question.objectif,
    derniere: etat.derniere
      ? {
          nom: liste.get(etat.derniere[0])!.nom,
          image: imagePokemon(etat.derniere[0]),
          correct: etat.derniere[1],
        }
      : null,
  }
}

/**
 * Le dernier Pokémon trouvé, pour l'écran de résultat
 */
export async function pokemonTrouve(id: number) {
  const liste = await chargerPokemons()
  const pokemon = liste.get(id)
  if (!pokemon) return null
  return {
    nom: pokemon.nom,
    media: { type: 'image' as const, url: imagePokemon(id), debut: 0, fin: null, bips: [] },
  }
}
