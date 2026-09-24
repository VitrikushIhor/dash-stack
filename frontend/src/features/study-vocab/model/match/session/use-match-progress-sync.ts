'use client'

import { useCallback, useEffect } from 'react'
import { type MatchAttempt } from '@/entities/vocab'
import {
  completeMatchSessionAction,
  createMatchSessionAction,
  recordMatchPairAction,
} from '../../../server'
import { type ControllerStore } from '../../shared/controller-store'
import { type MatchSessionStore } from './match-session.contract'

interface MatchProgressSyncOptions {
  store: ControllerStore<MatchSessionStore>
  restartVersion: number
  onComplete: () => Promise<unknown>
}

export function useMatchProgressSync({
  store,
  restartVersion,
  onComplete,
}: MatchProgressSyncOptions) {
  const { deckId, onlyDue, onlyStarred } = store.getState().scope

  useEffect(() => {
    const revision = store.getState().beginCreation()

    if (revision === null) return

    async function create(requestRevision: number) {
      try {
        const result = await createMatchSessionAction({
          deckId,
          onlyDue,
          onlyStarred,
        })

        if (!result.success) throw new Error(result.error)
        store.getState().receiveSession(result.data, requestRevision)
      } catch (error: unknown) {
        store.getState().fail(error, requestRevision)
      }
    }
    void create(revision)
  }, [deckId, onlyDue, onlyStarred, restartVersion, store])

  const complete = useCallback(async () => {
    const session = store.getState().session
    const revision = store.getState().beginCompletion()

    if (!session || revision === null) return
    try {
      const result = await completeMatchSessionAction({
        deckId,
        sessionId: session.id,
      })

      if (!result.success) throw new Error(result.error)
      if (!store.getState().isCurrent(revision)) return
      store.getState().receiveCompletion(result.data, revision)
      await onComplete()
    } catch (error: unknown) {
      store.getState().fail(error, revision)
    }
  }, [deckId, onComplete, store])

  const recordPair = useCallback(
    async (attempt: MatchAttempt) => {
      const session = store.getState().session

      if (!session) return false
      try {
        const result = await recordMatchPairAction({
          deckId,
          sessionId: session.id,
          ...attempt,
        })

        return result.success
      } catch {
        // The player retains the attempt and exposes its retry UI.
        return false
      }
    },
    [deckId, store]
  )

  const retry = useCallback(() => {
    if (store.getState().session) void complete()
    else store.getState().restart()
  }, [complete, store])

  return { complete, recordPair, retry }
}
