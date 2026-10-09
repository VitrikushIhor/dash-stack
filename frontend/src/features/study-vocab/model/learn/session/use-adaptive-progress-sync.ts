'use client'

import { useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { vocabKeys } from '@/entities/vocab'
import { submitProgressAction } from '../../../server'
import { canStartStudySync } from '../../shared/study-sync-guard'
import {
  LearnAnswerEvaluationKind,
  LearnFeedbackSyncState,
} from './adaptive-session.constants'
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

      if (feedback?.sync !== LearnFeedbackSyncState.Pending) return true
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
              isCorrect: feedback.kind !== LearnAnswerEvaluationKind.Incorrect,
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
            feedback: { ...feedback, sync: LearnFeedbackSyncState.Saved },
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
    const isResumedPendingAttempt =
      snapshot?.feedback?.sync === LearnFeedbackSyncState.Pending &&
      snapshot.session.questionId === resumedAttemptId
    const canResumeSync = canStartStudySync({
      isPending: isResumedPendingAttempt,
      isSyncing,
      isIdentityLoading,
      isEnabled: shouldSync,
    })

    if (!canResumeSync || !snapshot) return

    void syncAttempt(snapshot, true)
  }, [
    isIdentityLoading,
    isSyncing,
    resumedAttemptId,
    shouldSync,
    snapshot,
    syncAttempt,
  ])

  return syncAttempt
}
