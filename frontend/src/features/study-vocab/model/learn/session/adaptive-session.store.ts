import { createStore } from 'zustand/vanilla'
import { getErrorMessage } from '@/shared/api'
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
  let leaseSequence = 0
  let activeLease: number | null = null
  let answeringLease: number | null = null
  let syncingLease: number | null = null
  let snapshot: LearnSnapshot | null = null
  let error: string | null = null

  try {
    snapshot = loadLearnSnapshot(storageKey, deckId)
  } catch (storageError: unknown) {
    error = getErrorMessage(storageError)
  }

  return createStore<AdaptiveLearnStore>((set, get) => ({
    snapshot,
    error,
    isSyncing: false,
    syncingAttemptId: null,
    resumedAttemptId:
      snapshot?.feedback?.sync === 'pending'
        ? snapshot.session.questionId
        : null,
    persist: (next) => {
      if (activeLease === null) return
      saveLearnSnapshot(storageKey, next)
      set({ snapshot: next })
    },
    persistIfCurrent: (attemptId, next, lease) => {
      if (activeLease !== lease) return false
      if (get().snapshot?.session.questionId !== attemptId) return false
      saveLearnSnapshot(storageKey, next)
      set({ snapshot: next })

      return true
    },
    setError: (nextError) =>
      set({ error: nextError === null ? null : getErrorMessage(nextError) }),
    setErrorIfActive: (nextError, lease) => {
      if (activeLease !== lease) return false
      set({ error: nextError === null ? null : getErrorMessage(nextError) })

      return true
    },
    beginAnswer: () => {
      if (activeLease === null || answeringLease !== null) return null
      answeringLease = activeLease

      return activeLease
    },
    finishAnswer: (lease) => {
      if (answeringLease === lease) answeringLease = null
    },
    beginSync: (attemptId) => {
      if (activeLease === null || syncingLease !== null) return null
      syncingLease = activeLease
      set({ isSyncing: true, syncingAttemptId: attemptId })

      return activeLease
    },
    finishSync: (attemptId, lease) => {
      if (activeLease !== lease || syncingLease !== lease) return
      if (get().syncingAttemptId !== attemptId) return
      syncingLease = null
      set({ isSyncing: false, syncingAttemptId: null })
    },
    consumeResumedAttempt: (attemptId, lease) => {
      if (activeLease !== lease || get().resumedAttemptId !== attemptId) return
      set({ resumedAttemptId: null })
    },
    activate: () => {
      leaseSequence += 1
      activeLease = leaseSequence

      return activeLease
    },
    deactivate: (lease) => {
      if (activeLease !== lease) return
      activeLease = null
      if (answeringLease === lease) answeringLease = null
      if (syncingLease === lease) syncingLease = null
      set({ isSyncing: false, syncingAttemptId: null })
    },
  }))
}
