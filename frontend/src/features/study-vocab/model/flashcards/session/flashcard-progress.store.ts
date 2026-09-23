import { getErrorMessage } from '@/shared/api'
import { createControllerStore } from '../../shared/controller-store'
import { createSessionLifecycle } from '../../shared/session-lifecycle'
import { type FlashcardResult } from '../../shared/types'
import {
  type FlashcardProgressQueue,
  createFlashcardProgressQueue,
  loadFlashcardProgressQueues,
  saveFlashcardProgressQueues,
} from './flashcard-progress-queue.storage'
import {
  FlashcardProgressStatus,
  type FlashcardProgressStore,
} from './flashcard-progress.contract'

export function createFlashcardProgressStore(deckId: string) {
  const lifecycle = createSessionLifecycle()
  let waitingResults: FlashcardResult[] | null = null
  let recoveredUserId: string | null = null

  function persist(queue: FlashcardProgressQueue, userId: string) {
    const queues = loadFlashcardProgressQueues(userId, deckId).filter(
      (item) => item.sessionId !== queue.sessionId
    )

    if (queue.pending.length > 0) queues.push(queue)
    saveFlashcardProgressQueues(userId, deckId, queues)
  }

  return createControllerStore<FlashcardProgressStore>((set, get) => ({
    ownedQueue: null,
    status: FlashcardProgressStatus.IDLE,
    error: null,
    isSyncing: false,
    activate: lifecycle.activate,
    deactivate: (lease) => {
      if (!lifecycle.isActive(lease)) return
      lifecycle.deactivate(lease)
      set({ isSyncing: false })
    },

    complete: (results, userId) => {
      if (lifecycle.current() === null) return
      if (userId === undefined) {
        waitingResults = results
        set({
          status: FlashcardProgressStatus.WAITING_FOR_IDENTITY,
          error: null,
        })

        return
      }
      waitingResults = null
      if (userId === null) {
        set({ status: FlashcardProgressStatus.GUEST, error: null })

        return
      }
      try {
        const queue = createFlashcardProgressQueue(crypto.randomUUID(), results)
        persist(queue, userId)
        recoveredUserId = userId
        set({
          ownedQueue: { userId, queue },
          isSyncing: false,
          status: FlashcardProgressStatus.SAVING,
          error: null,
        })
      } catch (error: unknown) {
        set({
          status: FlashcardProgressStatus.ERROR,
          error: getErrorMessage(error),
        })
      }
    },

    resolveIdentity: (userId) => {
      if (userId === undefined) return null
      const owned = get().ownedQueue

      if (owned && owned.userId !== userId) {
        set({
          ownedQueue: null,
          isSyncing: false,
          status: FlashcardProgressStatus.ERROR,
          error: 'Study account changed before progress was saved',
        })
      }
      if (waitingResults !== null) {
        get().complete(waitingResults, userId)

        return null
      }
      if (!userId || get().ownedQueue || recoveredUserId === userId) return null
      try {
        const queue = loadFlashcardProgressQueues(userId, deckId).at(-1)
        recoveredUserId = userId
        if (!queue) return null
        set({
          ownedQueue: { userId, queue },
          isSyncing: false,
          status: FlashcardProgressStatus.SAVING,
          error: null,
        })

        return queue.results
      } catch (error: unknown) {
        set({
          status: FlashcardProgressStatus.ERROR,
          error: getErrorMessage(error),
        })

        return null
      }
    },

    beginSync: () => {
      const generation = lifecycle.current()
      const { ownedQueue, isSyncing } = get()

      if (generation === null || !ownedQueue || isSyncing) return null
      set({
        isSyncing: true,
        status: FlashcardProgressStatus.SAVING,
        error: null,
      })

      return { generation, sessionId: ownedQueue.queue.sessionId }
    },

    isCurrent: (lease) =>
      lifecycle.isActive(lease.generation) &&
      get().ownedQueue?.queue.sessionId === lease.sessionId,

    acknowledge: (queue, lease) => {
      const owned = get().ownedQueue

      if (!owned || !get().isCurrent(lease)) return
      persist(queue, owned.userId)
      set({ ownedQueue: { ...owned, queue } })
    },

    fail: (error, lease) => {
      if (get().isCurrent(lease))
        set({
          status: FlashcardProgressStatus.ERROR,
          error: getErrorMessage(error),
        })
    },

    finishSync: (lease) => {
      if (!get().isCurrent(lease)) return
      const finished = get().ownedQueue?.queue.pending.length === 0
      set(
        finished
          ? {
              ownedQueue: null,
              isSyncing: false,
              status: FlashcardProgressStatus.SAVED,
            }
          : { isSyncing: false }
      )
    },
  }))
}
