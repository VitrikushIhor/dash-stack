import { type FlashcardResult } from '../../shared/types'

export interface FlashcardGameState {
  sessionKey: string
  orderedCardIds: string[]
  currentIndex: number
  results: FlashcardResult[]
  isFlipped: boolean
}

export interface FlashcardGameStore extends FlashcardGameState {
  reconcile: (sessionKey: string, cardIds: string[]) => void
  answer: (cardId: string, isCorrect: boolean) => FlashcardResult[] | null
  flip: () => void
  navigate: (offset: number) => void
  shuffle: () => void
}
