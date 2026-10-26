import { readFile } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'

export const CATEGORY_IDS = [
  'cat1',
  'cat2',
  'cat3',
  'cat4',
  'cat5',
  'cat6',
  'cat7',
  'cat8',
  'cat9',
] as const

export type CategoryId = (typeof CATEGORY_IDS)[number]

/**
 * Un média. Pour le son et la vidéo, `debut` et `fin` (en secondes) limitent
 * la lecture à un extrait, et `bips` masque des passages : [[debut, fin], ...]
 */
export interface Media {
  type: 'image' | 'audio' | 'video'
  fichier: string
  debut?: number
  fin?: number
  bips?: [number, number][]
}

/**
 * Contenu affiché après une bonne réponse : du texte et/ou des médias
 */
export interface Apres {
  texte?: string
  medias?: Media[]
}

export interface QuestionTexte {
  type: 'texte'
  question: string
  media?: Media
  apres?: Apres
  reponses: string[]
  tolerance?: number
}

export type OptionChoix = { texte: string } | { image: string }

export interface QuestionChoix {
  type: 'choix'
  question: string
  media?: Media
  apres?: Apres
  options: OptionChoix[]
  bonne: number
}

export interface ElementListe {
  reponses: string[]
  quantite?: number
}

export interface QuestionListe {
  type: 'liste'
  question: string
  media?: Media
  apres?: Apres
  elements: ElementListe[]
  tolerance?: number
}

export interface QuestionSerie {
  type: 'serie'
  question: string
  media?: Media
  apres?: Apres
  generateur: 'pokemon-poids' | 'pokemon-taille'
  objectif: number
}

export type Question = QuestionTexte | QuestionChoix | QuestionListe | QuestionSerie

/**
 * Apparence d'une catégorie : une couleur de la palette et une icône pixel
 * (les noms disponibles sont dans inertia/components/pixel_icone.vue)
 */
export interface Theme {
  couleur: 'cyan' | 'bleu' | 'violet' | 'magenta' | 'rouge' | 'orange' | 'jaune' | 'lime' | 'vert'
  icone: string
}

export interface Category {
  nom: string
  theme?: Theme
  questions: Question[]
}

const THEME_PAR_DEFAUT: Theme = { couleur: 'cyan', icone: 'question' }

export function themeDe(categorie: Category): Theme {
  return { ...THEME_PAR_DEFAUT, ...categorie.theme }
}

export interface Content {
  categories: Record<CategoryId, Category>
}

export async function loadContent(): Promise<Content> {
  const raw = await readFile(app.makePath('content/jeu.json'), 'utf-8')
  return JSON.parse(raw)
}
