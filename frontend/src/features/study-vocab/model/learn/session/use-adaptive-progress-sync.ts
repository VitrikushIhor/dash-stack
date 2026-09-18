'use client'

import { useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { vocabKeys } from '@/entities/vocab'
import { submitProgressAction } from '../../../server'
import {
  type LearnProgressSyncParams,
  type LearnSnapshot,
} from './adaptive-session.contract'

export function useLearnProgressSync({
  deckId,
  isIdentityLoading,
  shouldSync,
  snapshot,
  isSyncing,
  resumedAttemptId,
  persistIfCurrent,
  setErrorIfActive,
  beginSync,
  finishSync,
  consumeResumedAttempt,
}: LearnProgressSyncParams) {
  const queryClient = useQueryClient()

  const syncAttempt = useCallback(
    async (
      pending: LearnSnapshot,
      consumeOnFinish = false
    ): Promise<boolean> => {
      const feedback = pending.feedback

      if (!feedback || feedback.sync !== 'pending') return true
      const current = pending.cards[pending.session.currentIndex]

      if (!current) return false
      const attemptId = pending.session.questionId
      const lease = beginSync(attemptId)

      if (lease === null) return false

      try {
        const result = await submitProgressAction({
          deckId,
          attemptId,
          results: [
            {
              flashcardId: current.id,
              isCorrect: feedback.kind !== 'incorrect',
            },
          ],
        })

        if (!result.success) {
          setErrorIfActive(new Error(result.error), lease)

          return false
        }

        persistIfCurrent(
          attemptId,
          {
            ...pending,
            feedback: { ...feedback, sync: 'saved' },
          },
          lease
        )
        setErrorIfActive(null, lease)
        void queryClient.invalidateQueries({ queryKey: vocabKeys.dueReviews() })

        return true
      } catch (syncError: unknown) {
        setErrorIfActive(syncError, lease)

        return false
      } finally {
        finishSync(attemptId, lease)
        if (consumeOnFinish) consumeResumedAttempt(attemptId, lease)
      }
    },
    [
      beginSync,
      consumeResumedAttempt,
      deckId,
      finishSync,
      persistIfCurrent,
      queryClient,
      setErrorIfActive,
    ]
  )

  useEffect(() => {
    if (
      !snapshot?.feedback ||
      snapshot.feedback.sync !== 'pending' ||
      snapshot.session.questionId !== resumedAttemptId ||
      isIdentityLoading ||
      !shouldSync ||
      isSyncing
    ) {
      return
    }
    void syncAttempt(snapshot, true)
  }, [
    consumeResumedAttempt,
    isIdentityLoading,
    isSyncing,
    resumedAttemptId,
    shouldSync,
    snapshot,
    syncAttempt,
  ])

  return syncAttempt
}
