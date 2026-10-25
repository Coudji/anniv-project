export type MediaFront = {
  type: 'image' | 'audio'
  url: string
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
}

export type RetourFront = {
  saisies: string[]
  valides: boolean[]
}
