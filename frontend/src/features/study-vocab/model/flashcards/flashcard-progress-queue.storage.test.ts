import { beforeEach, describe, expect, it } from 'vitest'
import {
  createFlashcardProgressQueue,
  loadFlashcardProgressQueues,
  saveFlashcardProgressQueues,
} from './session/flashcard-progress-queue.storage'

describe('flashcard progress queue storage', () => {
  beforeEach(() => localStorage.clear())

  it('persists every result from a 101-card session with a stable single-result attempt id', () => {
    const results = Array.from({ length: 101 }, (_, index) => ({
      flashcardId: `card-${index + 1}`,
      isCorrect: index % 2 === 0,
    }))
    const queue = createFlashcardProgressQueue('session-1', results)

    saveFlashcardProgressQueues('user-1', 'deck-1', [queue])

    expect(loadFlashcardProgressQueues('user-1', 'deck-1')).toEqual([queue])
    expect(queue.pending).toHaveLength(101)
    expect(
      queue.pending.every((item) =>
        item.attemptId.startsWith('flashcards:session-1:')
      )
    ).toBe(true)
  })

  it('does not load a queue belonging to a different user or deck', () => {
    const queue = createFlashcardProgressQueue('session-1', [
      { flashcardId: 'card-1', isCorrect: true },
    ])

    saveFlashcardProgressQueues('user-1', 'deck-1', [queue])

    expect(loadFlashcardProgressQueues('user-2', 'deck-1')).toEqual([])
    expect(loadFlashcardProgressQueues('user-1', 'deck-2')).toEqual([])
  })
})
