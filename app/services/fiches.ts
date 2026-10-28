import { readFile } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import type { Session } from '@adonisjs/session'
import type { QuestionFiche } from '#services/content'

type Champion = { nom: string; jeux?: string; ville?: string }

type Badge = {
  image: string
  region: string
  generation: number
  badge: string
  types: string[]
  champions: Champion[]
  villes: string[]
  note?: string
}

/**
 * Les infos d'une fiche. Le type ne peut pas servir de point de départ :
 * plusieurs badges partagent le même type.
 */
export type Champ = 'visuel' | 'nom' | 'champion' | 'ville' | 'type'
type Pivot = Exclude<Champ, 'type'>

const CHAMPS: Champ[] = ['visuel', 'nom', 'champion', 'ville', 'type']

/**
 * La fiche précédente, pour afficher la correction après chaque réponse
 */
type Derniere = { badge: number; pivot: Pivot; valeur: string; correct: boolean }

/**
 * État d'une fiche en cours, gardé dans la session (format compact : la session vit dans
 * un cookie). `cle` identifie la question (catégorie + numéro) : si elle change, on repart
 * de zéro. `valeur` est l'info de départ affichée (chemin de l'image, nom, champion ou ville).
 */
type EtatFiche = {
  cle: string
  compteur: number
  badge: number
  pivot: Pivot
  valeur: string
  derniere: Derniere | null
}

const CLE_SESSION = 'fiche'

let badges: Badge[] | null = null

async function chargerBadges() {
  if (!badges) {
    const raw = await readFile(app.makePath('content/badges.json'), 'utf-8')
    badges = (JSON.parse(raw) as { badges: Badge[] }).badges
  }
  return badges
}

function auHasard<T>(liste: T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]
}

/**
 * Les infos de départ possibles pour un badge : seulement celles qui ne désignent que lui
 * (pas "Badge Roche", qui existe à Kanto et à Hoenn, ni une ville qui a deux arènes selon
 * la version, comme Old Chister)
 */
function pivotsPossibles(liste: Badge[], badge: Badge): { pivot: Pivot; valeur: string }[] {
  const compter = (valeurs: string[], valeur: string) => valeurs.filter((v) => v === valeur).length
  const noms = liste.map((b) => b.badge)
  const champions = liste.flatMap((b) => b.champions.map((c) => c.nom))
  const villes = liste.flatMap((b) => b.villes)

  return [
    { pivot: 'visuel' as const, valeur: badge.image },
    ...(compter(noms, badge.badge) === 1 ? [{ pivot: 'nom' as const, valeur: badge.badge }] : []),
    ...badge.champions
      .filter((c) => compter(champions, c.nom) === 1)
      .map((c) => ({ pivot: 'champion' as const, valeur: c.nom })),
    ...badge.villes
      .filter((v) => compter(villes, v) === 1)
      .map((v) => ({ pivot: 'ville' as const, valeur: v })),
  ]
}

/**
 * Tire un badge (différent du précédent) et une info de départ.
 * On tire d'abord le type d'info, puis la valeur, pour que les champions et les villes
 * ne sortent pas plus souvent quand un badge en a plusieurs.
 */
async function tirerFiche(precedent?: number) {
  const liste = await chargerBadges()
  let badge = Math.floor(Math.random() * liste.length)
  while (badge === precedent) {
    badge = Math.floor(Math.random() * liste.length)
  }

  const possibles = pivotsPossibles(liste, liste[badge])
  const pivot = auHasard([...new Set(possibles.map((p) => p.pivot))])
  const { valeur } = auHasard(possibles.filter((p) => p.pivot === pivot))
  return { badge, pivot, valeur }
}

/**
 * Les réponses acceptées pour une info. Quand le champion ou la ville de départ ne
 * correspond qu'à une version (Aloé à Maillard, Tcheren à Pavonnay), l'autre info
 * doit aller avec.
 */
function acceptees(badge: Badge, champ: Champ, pivot: Pivot, valeur: string): string[] {
  switch (champ) {
    case 'visuel':
      return [badge.image]
    case 'nom':
      return [badge.badge]
    case 'type':
      return badge.types
    case 'champion':
      return badge.champions
        .filter((c) => pivot !== 'ville' || !c.ville || c.ville === valeur)
        .map((c) => c.nom)
    case 'ville': {
      const champion = badge.champions.find((c) => c.nom === valeur)
      return pivot === 'champion' && champion?.ville ? [champion.ville] : badge.villes
    }
  }
}

function champsDemandes(pivot: Pivot) {
  return CHAMPS.filter((champ) => champ !== pivot)
}

/**
 * Récupère la fiche en cours pour cette question, ou en démarre une nouvelle
 */
export async function etatFiche(session: Session, cle: string): Promise<EtatFiche> {
  const etat = session.get(CLE_SESSION) as EtatFiche | undefined
  if (etat?.cle === cle) return etat

  const nouvel: EtatFiche = { cle, compteur: 0, ...(await tirerFiche()), derniere: null }
  session.put(CLE_SESSION, nouvel)
  return nouvel
}

/**
 * Enregistre une fiche : +1 si toutes les infos sont justes, -1 sinon (sans descendre
 * sous 0), puis une nouvelle fiche. `fini` passe à true quand l'objectif est atteint.
 * `correct` est null si la réponse n'est pas une fiche (rien n'est compté).
 */
export async function repondreFiche(
  session: Session,
  cle: string,
  question: QuestionFiche,
  reponse: unknown
): Promise<{ fini: boolean; correct: boolean | null }> {
  const etat = await etatFiche(session, cle)
  if (!reponse || typeof reponse !== 'object') return { fini: false, correct: null }

  const liste = await chargerBadges()
  const badge = liste[etat.badge]
  const saisies = reponse as Record<string, unknown>

  const correct = champsDemandes(etat.pivot).every((champ) =>
    acceptees(badge, champ, etat.pivot, etat.valeur).includes(String(saisies[champ] ?? ''))
  )

  etat.compteur = correct ? etat.compteur + 1 : Math.max(0, etat.compteur - 1)

  if (etat.compteur >= question.objectif) {
    session.forget(CLE_SESSION)
    return { fini: true, correct }
  }

  etat.derniere = { badge: etat.badge, pivot: etat.pivot, valeur: etat.valeur, correct }
  Object.assign(etat, await tirerFiche(etat.badge))
  session.put(CLE_SESSION, etat)
  return { fini: false, correct }
}

/**
 * Abandonne la fiche en cours (en revenant à la grille, par exemple)
 */
export function oublierFiche(session: Session) {
  session.forget(CLE_SESSION)
}

const trier = (valeurs: string[]) =>
  [...new Set(valeurs)].sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }))

const url = (image: string) => `/medias/${image}`

/**
 * Tout ce qu'on peut choisir dans les listes (sans dire ce qui va avec quoi)
 */
async function options() {
  const liste = await chargerBadges()
  return {
    visuel: liste.map((b) => ({ valeur: b.image, url: url(b.image) })),
    nom: trier(liste.map((b) => b.badge)),
    champion: trier(liste.flatMap((b) => b.champions.map((c) => c.nom))),
    ville: trier(liste.flatMap((b) => b.villes)),
    type: trier(liste.flatMap((b) => b.types)),
  }
}

/**
 * La correction de la fiche précédente : toutes les infos du badge
 */
function correctionPourFront(liste: Badge[], derniere: Derniere) {
  const badge = liste[derniere.badge]
  return {
    correct: derniere.correct,
    pivot: derniere.pivot,
    image: url(badge.image),
    nom: badge.badge,
    champions: badge.champions.map((c) => (c.jeux ? `${c.nom} (${c.jeux})` : c.nom)).join(' ou '),
    villes: badge.villes.join(' ou '),
    types: badge.types.join(', '),
  }
}

/**
 * Ce que le front affiche : l'info de départ, les infos à trouver, les listes de choix,
 * et la correction de la fiche précédente
 */
export async function fichePourFront(etat: EtatFiche, question: QuestionFiche) {
  const liste = await chargerBadges()

  return {
    compteur: etat.compteur,
    objectif: question.objectif,
    pivot: {
      champ: etat.pivot,
      texte: etat.pivot === 'visuel' ? null : etat.valeur,
      image: etat.pivot === 'visuel' ? url(etat.valeur) : null,
    },
    champs: champsDemandes(etat.pivot),
    options: await options(),
    derniere: etat.derniere ? correctionPourFront(liste, etat.derniere) : null,
  }
}
