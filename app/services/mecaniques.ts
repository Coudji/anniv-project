import { distance } from 'fastest-levenshtein'
import type {
  Apres,
  Media,
  Question,
  QuestionChoix,
  QuestionListe,
  QuestionTexte,
} from '#services/content'

/**
 * Résultat d'une vérification. `retour` contient des informations
 * à renvoyer au front en cas d'erreur (pour la liste : les champs corrects)
 */
export interface Verification {
  correct: boolean
  retour?: { saisies: string[]; valides: boolean[] }
}

/**
 * Minuscules, sans accents, sans ponctuation (! ? . , ; : « » " …), espaces multiples
 * réduits, sans article au début ("le corbeau", "l'échidné").
 * Les apostrophes et les tirets sont gardés ("l'air", "trente-huit").
 */
function normaliser(texte: string) {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[!?.,;:«»"“”…]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(?:(?:le|la|les|un|une|des|du) |l['’] ?)/, '')
}

/**
 * Nombre de fautes acceptées selon la longueur de la réponse attendue
 */
function toleranceParDefaut(attendue: string) {
  if (attendue.length <= 4) return 0
  if (attendue.length <= 8) return 1
  return 2
}

/**
 * La saisie correspond-elle à l'une des réponses acceptées, à la tolérance près ?
 */
function correspond(saisie: string, acceptees: string[], tolerance?: number) {
  const donnee = normaliser(saisie)

  return acceptees.some((acceptee) => {
    const attendue = normaliser(acceptee)
    return distance(donnee, attendue) <= (tolerance ?? toleranceParDefaut(attendue))
  })
}

/**
 * Sépare une quantité en tête de saisie : "3 lingots de fer", "3x fer", "3 x fer"
 */
function lireQuantite(saisie: string) {
  const match = saisie.match(/^(\d+)\s*(?:x\s)?\s*(.+)$/i)
  return match ? { quantite: Number(match[1]), nom: match[2] } : { quantite: null, nom: saisie }
}

function verifierTexte(question: QuestionTexte, reponse: unknown): Verification {
  return { correct: correspond(String(reponse ?? ''), question.reponses, question.tolerance) }
}

/**
 * Choix unique : l'index envoyé doit être le bon.
 * Choix multiple : les index cochés doivent être exactement les bons, sans oubli ni en trop.
 */
function verifierChoix(question: QuestionChoix, reponse: unknown): Verification {
  if (!Array.isArray(question.bonne)) {
    return { correct: String(reponse ?? '') === String(question.bonne) }
  }

  const cochees = new Set(
    (Array.isArray(reponse) ? reponse : [reponse]).map((r) => String(r ?? ''))
  )
  const bonnes = new Set(question.bonne.map(String))

  return {
    correct: cochees.size === bonnes.size && [...bonnes].every((index) => cochees.has(index)),
  }
}

/**
 * Chaque champ est associé au premier élément attendu, pas encore trouvé, qui lui correspond.
 * C'est correct quand tous les éléments sont trouvés et qu'aucun champ rempli n'est faux.
 */
function verifierListe(question: QuestionListe, reponse: unknown): Verification {
  const saisies = (Array.isArray(reponse) ? reponse : [reponse]).map((s) => String(s ?? '').trim())
  const trouves = new Set<number>()

  const valides = saisies.map((saisie) => {
    if (!saisie) return false

    const { quantite, nom } = lireQuantite(saisie)
    const index = question.elements.findIndex(
      (element, i) =>
        !trouves.has(i) &&
        (element.quantite === undefined || element.quantite === quantite) &&
        correspond(nom, element.reponses, question.tolerance)
    )

    if (index === -1) return false
    trouves.add(index)
    return true
  })

  const correct =
    question.minimum !== undefined
      ? trouves.size >= question.minimum
      : trouves.size === question.elements.length && saisies.every((s, i) => !s || valides[i])

  return { correct, retour: { saisies, valides } }
}

/**
 * Vérifie la réponse selon le type de la question
 */
export function verifierReponse(question: Question, reponse: unknown): Verification {
  switch (question.type) {
    case 'texte':
      return verifierTexte(question, reponse)
    case 'choix':
      return verifierChoix(question, reponse)
    case 'liste':
      return verifierListe(question, reponse)
    case 'serie':
    case 'fiche':
    case 'intro':
      // Les séries, les fiches et les intros sont gérées à part (services/series,
      // services/fiches et services/intros), car elles ont un état
      return { correct: false }
  }
}

/**
 * Transforme le média du JSON en ce qu'il faut au front pour l'afficher
 */
function mediaPourFront(media?: Media) {
  if (!media) return null

  return {
    type: media.type,
    url: `/medias/${media.fichier}`,
    debut: media.debut ?? 0,
    fin: media.fin ?? null,
    bips: media.bips ?? [],
  }
}

/**
 * Le contenu complémentaire, envoyé au front seulement après la bonne réponse
 */
export function apresPourFront(apres?: Apres) {
  if (!apres) return null

  return {
    texte: apres.texte ?? null,
    medias: (apres.medias ?? []).map((media) => mediaPourFront(media)!),
  }
}

/**
 * Ne garde que ce que le front a le droit de voir
 */
export function questionPourFront(question: Question) {
  switch (question.type) {
    case 'texte':
    case 'liste':
    case 'serie':
    case 'fiche':
    case 'intro':
      return {
        type: question.type,
        question: question.question,
        media: mediaPourFront(question.media),
      }

    case 'choix':
      return {
        type: question.type,
        question: question.question,
        media: mediaPourFront(question.media),
        multiple: Array.isArray(question.bonne),
        options: question.options.map((option) =>
          'texte' in option ? { texte: option.texte } : { image: `/medias/${option.image}` }
        ),
      }
  }
}
