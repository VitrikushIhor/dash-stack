'use client'

import { useCallback } from 'react'
import { useCurrentUser } from '@/entities/user'
import { type StudyCard } from '@/entities/vocab'
import { answerAdaptiveLearnQuestion } from '../answer/adaptive-answer'
import { createLearnChoices } from '../answer/answer-options'
import { continueLearnSession } from './adaptive-session'
import { LearnPhase, LearnStage } from './adaptive-session.constants'
import {
  type LearnAnswer,
  type LearnSnapshot,
} from './adaptive-session.contract'
import { createLearnSnapshot } from './adaptive-session.storage'
import { useLearnProgressSync } from './use-adaptive-progress-sync'
import { useAdaptiveLearnStore } from './use-adaptive-session-store'

export function useAdaptiveLearn(
  deckId: string,
  initialCards: StudyCard[],
  sessionKey: string = deckId
) {
  const { data: user, isLoading: isUserLoading } = useCurrentUser()
  const storageKey = `vocab-learn:${user?.id ?? 'guest'}:${sessionKey}`
  const {
    snapshot,
    error,
    isSyncing,
    resumedAttemptId,
    persist,
    persistIfCurrent,
    setError,
    setErrorIfActive,
    beginAnswer,
    finishAnswer,
    beginSync,
    finishSync,
    consumeResumedAttempt,
  } = useAdaptiveLearnStore(storageKey, deckId)

  const syncAttempt = useLearnProgressSync({
    deckId,
    isIdentityLoading: isUserLoading,
    shouldSync: Boolean(user),
    snapshot,
    isSyncing,
    resumedAttemptId,
    persistIfCurrent,
    setErrorIfActive,
    beginSync,
    finishSync,
    consumeResumedAttempt,
  })

  const start = useCallback(() => {
    try {
      persist(createLearnSnapshot(initialCards))
      setError(null)
    } catch (storageError: unknown) {
      setError(storageError)
    }
  }, [initialCards, persist, setError])

  const answer = useCallback(
    async (answerValue: LearnAnswer) => {
      if (!snapshot || snapshot.session.phase !== LearnPhase.Question) return
      const lease = beginAnswer()

      if (lease === null) return
      try {
        const answered = answerAdaptiveLearnQuestion(
          snapshot,
          answerValue,
          user ? 'pending' : 'guest'
        )

        if (!answered) return
        persist(answered)
        setError(null)
        if (user) await syncAttempt(answered)
      } catch (answerError: unknown) {
        setError(answerError)
      } finally {
        finishAnswer(lease)
      }
    },
    [beginAnswer, finishAnswer, persist, setError, snapshot, syncAttempt, user]
  )

  const next = useCallback(() => {
    if (!snapshot?.feedback || snapshot.feedback.sync === 'pending') return
    const session = continueLearnSession(snapshot.session)
    const card = snapshot.cards[session.currentIndex]
    const mastery = session.cards[session.currentIndex]?.mastery
    const nextSnapshot: LearnSnapshot = {
      ...snapshot,
      session,
      choices:
        session.phase === LearnPhase.Question &&
        card &&
        mastery?.stage === LearnStage.Mcq
          ? createLearnChoices(card, snapshot.cards)
          : null,
      feedback: null,
    }

    try {
      persist(nextSnapshot)
      setError(null)
    } catch (storageError: unknown) {
      setError(storageError)
    }
  }, [persist, setError, snapshot])

  const retry = useCallback(async () => {
    if (snapshot) await syncAttempt(snapshot)
  }, [snapshot, syncAttempt])

  const restart = useCallback(() => {
    try {
      const fresh = createLearnSnapshot(
        initialCards.length ? initialCards : (snapshot?.cards ?? [])
      )

      persist(fresh)
      setError(null)
    } catch (storageError: unknown) {
      setError(storageError)
    }
  }, [initialCards, persist, setError, snapshot])

  return {
    snapshot,
    isLoading: isUserLoading,
    isSyncing,
    error,
    start,
    answer,
    next,
    retry,
    restart,
  }
}
