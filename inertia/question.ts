export type MediaFront = {
  type: 'image' | 'audio' | 'video'
  url: string
  debut: number
  fin: number | null
  bips: [number, number][]
}

export type OptionFront = {
  texte?: string
  image?: string
}

export type QuestionFront = {
  type: string
  question: string
  media: MediaFront | null
  options?: OptionFront[]
  serie?: SerieFront
}

export type RetourFront = {
  saisies: string[]
  valides: boolean[]
}

export type FichePokemon = {
  nom: string
  image: string
}

export type LigneSerie = {
  a: FichePokemon & { valeur: string }
  b: FichePokemon & { valeur: string }
  signe: string
  correct: boolean
}

export type SerieFront = {
  compteur: number
  objectif: number
  paire: { a: FichePokemon; b: FichePokemon }
  historique: LigneSerie[]
}

export type ApresFront = {
  texte: string | null
  medias: MediaFront[]
}

export type ResolueFront = {
  question: string
  media: MediaFront | null
  serie: LigneSerie[] | null
  apres: ApresFront | null
}
