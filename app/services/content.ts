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

export interface Media {
  type: 'image' | 'audio'
  fichier: string
}

export interface QuestionTexte {
  type: 'texte'
  question: string
  media?: Media
  reponses: string[]
  tolerance?: number
}

export type OptionChoix = { texte: string } | { image: string }

export interface QuestionChoix {
  type: 'choix'
  question: string
  media?: Media
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
  elements: ElementListe[]
  tolerance?: number
}

export type Question = QuestionTexte | QuestionChoix | QuestionListe

export interface Category {
  nom: string
  questions: Question[]
}

export interface Content {
  categories: Record<CategoryId, Category>
}

export async function loadContent(): Promise<Content> {
  const raw = await readFile(app.makePath('content/jeu.json'), 'utf-8')
  return JSON.parse(raw)
}
