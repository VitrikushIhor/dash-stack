import { getErrorMessage } from '@/shared/api'
import { createControllerStore } from '../../shared/controller-store'
import { createSessionLifecycle } from '../../shared/session-lifecycle'
import { LearnFeedbackSyncState } from './adaptive-session.constants'
import {
  type AdaptiveLearnStore,
  type CreateAdaptiveLearnStoreParams,
  type LearnSnapshot,
} from './adaptive-session.contract'
import {
  loadLearnSnapshot,
  saveLearnSnapshot,
} from './adaptive-session.storage'

export function createAdaptiveLearnStore({
  storageKey,
  deckId,
}: CreateAdaptiveLearnStoreParams) {
  const lifecycle = createSessionLifecycle()
  let answeringLease: number | null = null
  let syncingLease: number | null = null
  let snapshot: LearnSnapshot | null = null
  let error: string | null = null

  try {
    snapshot = loadLearnSnapshot(storageKey, deckId)
  } catch (storageError: unknown) {
    error = getErrorMessage(storageError)
  }

  return createControllerStore<AdaptiveLearnStore>((set, get) => ({
    snapshot,
    error,
    isSyncing: false,
    syncingAttemptId: null,
    resumedAttemptId:
      snapshot?.feedback?.sync === LearnFeedbackSyncState.Pending
        ? snapshot.session.questionId
        : null,
    persist: (next) => {
      if (lifecycle.current() === null) return
      saveLearnSnapshot(storageKey, next)
      set({ snapshot: next })
    },
    persistIfCurrent: (attemptId, next, lease) => {
      if (!lifecycle.isActive(lease)) return false
      if (get().snapshot?.session.questionId !== attemptId) return false
      saveLearnSnapshot(storageKey, next)
      set({ snapshot: next })

      return true
    },
    setError: (nextError) =>
      set({ error: nextError === null ? null : getErrorMessage(nextError) }),
    setErrorIfActive: (nextError, lease) => {
      if (!lifecycle.isActive(lease)) return false
      set({ error: nextError === null ? null : getErrorMessage(nextError) })

      return true
    },
    beginAnswer: () => {
      if (lifecycle.current() === null || answeringLease !== null) return null
      answeringLease = lifecycle.current()

      return lifecycle.current()
    },
    finishAnswer: (lease) => {
      if (answeringLease === lease) answeringLease = null
    },
    beginSync: (attemptId) => {
      if (lifecycle.current() === null || syncingLease !== null) return null
      syncingLease = lifecycle.current()
      set({ isSyncing: true, syncingAttemptId: attemptId })

      return lifecycle.current()
    },
    finishSync: (attemptId, lease) => {
      if (!lifecycle.isActive(lease) || syncingLease !== lease) return
      if (get().syncingAttemptId !== attemptId) return
      syncingLease = null
      set({ isSyncing: false, syncingAttemptId: null })
    },
    consumeResumedAttempt: (attemptId, lease) => {
      if (!lifecycle.isActive(lease) || get().resumedAttemptId !== attemptId)
        return
      set({ resumedAttemptId: null })
    },
    activate: lifecycle.activate,
    deactivate: (lease) => {
      if (!lifecycle.isActive(lease)) return
      lifecycle.deactivate(lease)
      if (answeringLease === lease) answeringLease = null
      if (syncingLease === lease) syncingLease = null
      set({ isSyncing: false, syncingAttemptId: null })
    },
  }))
}
