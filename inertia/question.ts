export interface MediaFront {
  type: 'image' | 'audio'
  url: string
}

export interface OptionFront {
  texte?: string
  image?: string
}

export interface QuestionFront {
  type: string
  question: string
  media: MediaFront | null
  options?: OptionFront[]
}
