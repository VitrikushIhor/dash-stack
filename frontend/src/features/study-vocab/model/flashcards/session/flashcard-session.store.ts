import { type StudyCard } from '@/entities/vocab'
import { createControllerStore } from '../../shared/controller-store'
import { type FlashcardResult } from '../../shared/types'

interface FlashcardSessionStore {
  cards: StudyCard[]
  results: FlashcardResult[] | null
  sessionVersion: number
  recover: (results: FlashcardResult[]) => void
  restart: (cards: StudyCard[]) => void
  retryIncorrect: (cards: StudyCard[]) => void
}

export function createFlashcardSessionStore(initialCards: StudyCard[]) {
  return createControllerStore<FlashcardSessionStore>((set, get) => ({
    cards: initialCards,
    results: null,
    sessionVersion: 0,
    recover: (results) => set({ results }),
    restart: (cards) =>
      set({
        cards,
        results: null,
        sessionVersion: get().sessionVersion + 1,
      }),
    retryIncorrect: (cards) => {
      const { results, sessionVersion } = get()

      if (!results) return
      const incorrectIds = new Set(
        results
          .filter((result) => !result.isCorrect)
          .map((result) => result.flashcardId)
      )
      set({
        cards: cards.filter((card) => incorrectIds.has(card.id)),
        results: null,
        sessionVersion: sessionVersion + 1,
      })
    },
  }))
}
