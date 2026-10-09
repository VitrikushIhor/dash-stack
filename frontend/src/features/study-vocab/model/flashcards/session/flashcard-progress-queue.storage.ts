import { type FlashcardResult } from '../../shared/types'
import {
  type FlashcardProgressQueue,
  FlashcardProgressQueuesSchema,
} from './flashcard-progress-queue.schema'

export type { FlashcardProgressQueue } from './flashcard-progress-queue.schema'

const STORAGE_PREFIX = 'vocab-flashcards-progress:v1'

function storageKey(userId: string, deckId: string): string {
  return `${STORAGE_PREFIX}:${userId}:${deckId}`
}

export function createFlashcardProgressQueue(
  sessionId: string,
  results: FlashcardResult[]
): FlashcardProgressQueue {
  const pending = results.map((result, index) => ({
    ...result,
    attemptId: `flashcards:${sessionId}:${index}`,
  }))

  return {
    version: 1,
    sessionId,
    results: results.map(({ flashcardId, isCorrect }) => ({
      flashcardId,
      isCorrect,
    })),
    pending,
  }
}

export function loadFlashcardProgressQueues(
  userId: string,
  deckId: string
): FlashcardProgressQueue[] {
  const key = storageKey(userId, deckId)
  const raw = localStorage.getItem(key)

  if (!raw) return []

  try {
    return FlashcardProgressQueuesSchema.parse(JSON.parse(raw))
  } catch {
    localStorage.removeItem(key)

    return []
  }
}

export function saveFlashcardProgressQueues(
  userId: string,
  deckId: string,
  queues: FlashcardProgressQueue[]
): void {
  const key = storageKey(userId, deckId)

  if (queues.length === 0) {
    localStorage.removeItem(key)

    return
  }

  localStorage.setItem(
    key,
    JSON.stringify(FlashcardProgressQueuesSchema.parse(queues))
  )
}
