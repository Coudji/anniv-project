import { distance } from 'fastest-levenshtein'
import type { Media, Question, QuestionTexte } from '#services/content'

/**
 * Minuscules, sans accents, espaces multiples réduits
 */
function normaliser(texte: string) {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * Nombre de fautes acceptées selon la longueur de la réponse attendue
 */
function toleranceParDefaut(attendue: string) {
  if (attendue.length <= 4) return 0
  if (attendue.length <= 8) return 1
  return 2
}

function verifierTexte(question: QuestionTexte, reponse: string) {
  const donnee = normaliser(reponse)

  return question.reponses.some((acceptee) => {
    const attendue = normaliser(acceptee)
    const tolerance = question.tolerance ?? toleranceParDefaut(attendue)
    return distance(donnee, attendue) <= tolerance
  })
}

/**
 * Vérifie la réponse selon le type de la question
 */
export function verifierReponse(question: Question, reponse: string) {
  switch (question.type) {
    case 'texte':
      return verifierTexte(question, reponse)
  }
}

/**
 * Transforme le média du JSON en ce qu'il faut au front pour l'afficher
 */
function mediaPourFront(media?: Media) {
  return media ? { type: media.type, url: `/medias/${media.fichier}` } : null
}

/**
 * Ne garde que ce que le front a le droit de voir
 */
export function questionPourFront(question: Question) {
  switch (question.type) {
    case 'texte':
      return {
        type: question.type,
        question: question.question,
        media: mediaPourFront(question.media),
      }
  }
}
