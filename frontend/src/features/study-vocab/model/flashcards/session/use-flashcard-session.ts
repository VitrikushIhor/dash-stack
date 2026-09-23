'use client'

import { useCallback, useState } from 'react'
import { type StudyCard } from '@/entities/vocab'
import { type FlashcardResult } from '../../shared/types'
import { useController } from '../../shared/use-session-store'
import { useStudyControllerFactories } from '../../study-controllers-provider'
import { useFlashcardProgressSync } from './use-flashcard-progress-sync'

export function useFlashcardSession({
  deckId,
  initialCards,
}: {
  deckId: string
  initialCards: StudyCard[]
}) {
  const { flashcardSession } = useStudyControllerFactories()
  const [store] = useState(() => flashcardSession(initialCards))
  const { cards, results, sessionVersion, recover } = useController(store)
  const { complete, retry, isSubmitting, status, error } =
    useFlashcardProgressSync({ deckId, onRecover: recover })
  const completeSession = useCallback(
    (sessionResults: FlashcardResult[]) => {
      recover(sessionResults)
      complete(sessionResults)
    },
    [complete, recover]
  )

  const restart = useCallback(
    () => store.getState().restart(initialCards),
    [initialCards, store]
  )
  const retryIncorrect = useCallback(
    () => store.getState().retryIncorrect(initialCards),
    [initialCards, store]
  )

  return {
    cards,
    results,
    sessionVersion,
    completeSession,
    restart,
    retryIncorrect,
    isSubmitting,
    progressStatus: status,
    progressError: error,
    retryProgress: retry,
  }
}
