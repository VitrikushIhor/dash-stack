import { shuffle } from '@/shared/lib/utils'
import { createControllerStore } from '../../shared/controller-store'
import { answerFlashcard } from './flashcard-game'
import { type FlashcardGameStore } from './flashcard-game.contract'

export function createFlashcardGameStore(
  sessionKey: string,
  cardIds: string[]
) {
  return createControllerStore<FlashcardGameStore>((set, get) => ({
    sessionKey,
    orderedCardIds: cardIds,
    currentIndex: 0,
    results: [],
    isFlipped: false,
    reconcile: (nextKey, nextIds) => {
      if (get().sessionKey === nextKey) return
      set({
        sessionKey: nextKey,
        orderedCardIds: nextIds,
        currentIndex: 0,
        results: [],
        isFlipped: false,
      })
    },
    answer: (cardId, isCorrect) => {
      const previous = get()
      const next = answerFlashcard(previous, cardId, isCorrect)

      if (next === previous) return null
      set(next)

      return next.results.length === next.orderedCardIds.length
        ? next.results
        : null
    },
    flip: () => set({ isFlipped: !get().isFlipped }),
    navigate: (offset) => {
      const { orderedCardIds, currentIndex } = get()

      if (orderedCardIds.length === 0) return
      set({
        currentIndex:
          (currentIndex + offset + orderedCardIds.length) %
          orderedCardIds.length,
        isFlipped: false,
      })
    },
    shuffle: () => {
      const { orderedCardIds, currentIndex } = get()

      if (orderedCardIds.length < 2) return
      const shuffled = shuffle(orderedCardIds)
      set({
        orderedCardIds: shuffled,
        currentIndex: shuffled.indexOf(orderedCardIds[currentIndex]),
        isFlipped: false,
      })
    },
  }))
}
