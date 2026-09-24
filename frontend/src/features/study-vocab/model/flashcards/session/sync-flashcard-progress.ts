import { submitProgressAction } from '../../../server'
import { type ControllerStore } from '../../shared/controller-store'
import { type FlashcardProgressQueue } from './flashcard-progress-queue.storage'
import { type FlashcardProgressStore } from './flashcard-progress.contract'

const MAX_SUBMIT_ATTEMPTS = 3
const RETRY_DELAY_MS = 250

export async function syncFlashcardProgress(
  deckId: string,
  store: ControllerStore<FlashcardProgressStore>,
  currentUserId: () => string | null | undefined
): Promise<boolean> {
  const owned = store.getState().ownedQueue

  if (!owned || currentUserId() !== owned.userId) return false
  const lease = store.getState().beginSync()

  if (!lease) return false
  const isCurrent = () => store.getState().isCurrent(lease)

  try {
    let queue = owned.queue
    for (const attempt of queue.pending) {
      const saveResult = await saveAttemptWithRetry({
        attempt,
        deckId,
        expectedUserId: owned.userId,
        currentUserId,
        isCurrent,
      })

      if (saveResult.kind === 'cancelled') return false
      if (saveResult.kind === 'failed') throw new Error(saveResult.message)
      queue = {
        ...queue,
        pending: queue.pending.filter(
          (item) => item.attemptId !== attempt.attemptId
        ),
      }
      store.getState().acknowledge(queue, lease)
    }

    return true
  } catch (error: unknown) {
    store.getState().fail(error, lease)

    return false
  } finally {
    store.getState().finishSync(lease)
  }
}

type SaveAttemptOptions = {
  attempt: FlashcardProgressQueue['pending'][number]
  deckId: string
  expectedUserId: string
  currentUserId: () => string | null | undefined
  isCurrent: () => boolean
}

type SaveAttemptResult =
  | { kind: 'saved' }
  | { kind: 'cancelled' }
  | { kind: 'failed'; message: string }

async function saveAttemptWithRetry({
  attempt,
  deckId,
  expectedUserId,
  currentUserId,
  isCurrent,
}: SaveAttemptOptions): Promise<SaveAttemptResult> {
  let lastError = 'Unable to save study progress'

  for (let retry = 1; retry <= MAX_SUBMIT_ATTEMPTS; retry += 1) {
    if (!isCurrent()) return { kind: 'cancelled' }
    if (currentUserId() !== expectedUserId)
      throw new Error('Study account changed before progress was saved')

    const result = await submitProgressAction({
      deckId,
      attemptId: attempt.attemptId,
      results: [
        { flashcardId: attempt.flashcardId, isCorrect: attempt.isCorrect },
      ],
    })

    if (!isCurrent()) return { kind: 'cancelled' }
    if (result.success) return { kind: 'saved' }

    lastError = result.error
    if (retry < MAX_SUBMIT_ATTEMPTS) await waitForRetry(retry)
  }

  return { kind: 'failed', message: lastError }
}

function waitForRetry(retry: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, RETRY_DELAY_MS * retry)
  })
}
