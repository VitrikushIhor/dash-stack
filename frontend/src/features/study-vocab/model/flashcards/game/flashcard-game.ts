import { type FlashcardGameState } from './flashcard-game.contract'

export function answerFlashcard(
  state: FlashcardGameState,
  cardId: string,
  isCorrect: boolean
): FlashcardGameState {
  if (
    !state.orderedCardIds.includes(cardId) ||
    state.results.some((item) => item.flashcardId === cardId)
  )
    return state
  const results = [...state.results, { flashcardId: cardId, isCorrect }]
  const answeredIds = new Set(results.map((item) => item.flashcardId))
  let currentIndex = state.currentIndex
  for (let offset = 1; offset <= state.orderedCardIds.length; offset += 1) {
    const nextIndex =
      (state.currentIndex + offset) % state.orderedCardIds.length

    if (!answeredIds.has(state.orderedCardIds[nextIndex])) {
      currentIndex = nextIndex
      break
    }
  }

  return { ...state, results, currentIndex, isFlipped: false }
}
