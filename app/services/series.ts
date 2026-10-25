import { readFile } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import type { Session } from '@adonisjs/session'
import type { QuestionSerie } from '#services/content'

type Pokemon = { id: number; nom: string; poids: number; taille: number }
type Choix = 'a' | 'egal' | 'b'

/**
 * Ce qu'on compare selon le générateur. Les valeurs de PokéAPI sont en
 * hectogrammes et en décimètres : divisées par 10, on obtient des kg et des m.
 */
type Critere = { valeur: (p: Pokemon) => number; unite: string }

const CRITERES: Record<QuestionSerie['generateur'], Critere> = {
  'pokemon-poids': { valeur: (p) => p.poids, unite: 'kg' },
  'pokemon-taille': { valeur: (p) => p.taille, unite: 'm' },
}

/**
 * Une réponse de l'historique, en format compact (la session est stockée dans un cookie) :
 * [id du Pokémon A, id du Pokémon B, bonne réponse ?]
 */
type Entree = [a: number, b: number, correct: boolean]

export type HistoriqueSerie = Entree[]

/**
 * État d'une série en cours, gardé dans la session.
 * `cle` identifie la question (catégorie + numéro) : si elle change, la série repart de zéro.
 */
type EtatSerie = {
  cle: string
  compteur: number
  paire: [number, number]
  historique: Entree[]
}

const CLE_SESSION = 'serie'
const HISTORIQUE_MAX = 20
const CHOIX: Choix[] = ['a', 'egal', 'b']

let pokemons: Map<number, Pokemon> | null = null

async function chargerPokemons() {
  if (!pokemons) {
    const raw = await readFile(app.makePath('content/pokemon.json'), 'utf-8')
    const liste: Pokemon[] = JSON.parse(raw)
    pokemons = new Map(liste.map((p) => [p.id, p]))
  }
  return pokemons
}

async function tirerPaire(): Promise<[number, number]> {
  const liste = await chargerPokemons()
  const ids = [...liste.keys()]
  const a = ids[Math.floor(Math.random() * ids.length)]
  let b = a
  while (b === a) {
    b = ids[Math.floor(Math.random() * ids.length)]
  }
  return [a, b]
}

async function bonneReponse([a, b]: [number, number], question: QuestionSerie): Promise<Choix> {
  const liste = await chargerPokemons()
  const { valeur } = CRITERES[question.generateur]
  const valeurA = valeur(liste.get(a)!)
  const valeurB = valeur(liste.get(b)!)
  if (valeurA > valeurB) return 'a'
  if (valeurA < valeurB) return 'b'
  return 'egal'
}

function imagePokemon(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

/**
 * Récupère la série en cours pour cette question, ou en démarre une nouvelle
 */
export async function etatSerie(session: Session, cle: string): Promise<EtatSerie> {
  const etat = session.get(CLE_SESSION) as EtatSerie | undefined
  if (etat?.cle === cle) return etat

  const nouvel: EtatSerie = { cle, compteur: 0, paire: await tirerPaire(), historique: [] }
  session.put(CLE_SESSION, nouvel)
  return nouvel
}

/**
 * Enregistre une réponse : +1 si juste, -1 si faux (sans descendre sous 0).
 * Renvoie l'historique complet (dernière réponse comprise) quand l'objectif est atteint,
 * null sinon.
 */
export async function repondreSerie(
  session: Session,
  cle: string,
  question: QuestionSerie,
  reponse: unknown
): Promise<HistoriqueSerie | null> {
  const etat = await etatSerie(session, cle)
  if (!CHOIX.includes(reponse as Choix)) return null

  const correct = reponse === (await bonneReponse(etat.paire, question))
  etat.compteur = correct ? etat.compteur + 1 : Math.max(0, etat.compteur - 1)
  etat.historique = [...etat.historique, [...etat.paire, correct] as Entree].slice(-HISTORIQUE_MAX)

  if (etat.compteur >= question.objectif) {
    session.forget(CLE_SESSION)
    return etat.historique
  }

  etat.paire = await tirerPaire()
  session.put(CLE_SESSION, etat)
  return null
}

/**
 * Abandonne la série en cours (en revenant à la grille, par exemple)
 */
export function oublierSerie(session: Session) {
  session.forget(CLE_SESSION)
}

function fiche(liste: Map<number, Pokemon>, id: number) {
  return { nom: liste.get(id)!.nom, image: imagePokemon(id) }
}

/**
 * Les lignes du tableau, avec les valeurs révélées, la plus récente en premier
 */
export async function historiquePourFront(historique: HistoriqueSerie, question: QuestionSerie) {
  const liste = await chargerPokemons()
  const { valeur, unite } = CRITERES[question.generateur]

  const ficheAvecValeur = (id: number) => ({
    ...fiche(liste, id),
    valeur: `${(valeur(liste.get(id)!) / 10).toLocaleString('fr-FR')} ${unite}`,
  })

  const lignes = await Promise.all(
    historique.map(async ([a, b, correct]) => {
      const bonne = await bonneReponse([a, b], question)
      return {
        a: ficheAvecValeur(a),
        b: ficheAvecValeur(b),
        signe: bonne === 'a' ? '>' : bonne === 'b' ? '<' : '=',
        correct,
      }
    })
  )

  return lignes.reverse()
}

/**
 * Ce que le front affiche : la paire en cours (sans les valeurs) et l'historique (avec les valeurs)
 */
export async function seriePourFront(etat: EtatSerie, question: QuestionSerie) {
  const liste = await chargerPokemons()

  return {
    compteur: etat.compteur,
    objectif: question.objectif,
    paire: { a: fiche(liste, etat.paire[0]), b: fiche(liste, etat.paire[1]) },
    historique: await historiquePourFront(etat.historique, question),
  }
}
