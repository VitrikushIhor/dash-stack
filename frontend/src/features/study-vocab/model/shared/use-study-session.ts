'use client'

import { useCallback, useState } from 'react'
import { type StudyCard } from '@/entities/vocab'
import { type StudyAnswerResult } from './types'

interface UseStudySessionOptions {
  initialCards: StudyCard[]
  onComplete: (results: StudyAnswerResult[]) => void
}

export function useStudySession({
  initialCards,
  onComplete,
}: UseStudySessionOptions) {
  const [cards, setCards] = useState<StudyCard[]>(initialCards)
  const [results, setResults] = useState<StudyAnswerResult[] | null>(null)
  const [sessionVersion, setSessionVersion] = useState(0)

  const completeSession = useCallback(
    (sessionResults: StudyAnswerResult[]) => {
      setResults(sessionResults)
      onComplete(sessionResults)
    },
    [onComplete]
  )

  const restart = useCallback(() => {
    setCards(initialCards)
    setResults(null)
    setSessionVersion((version) => version + 1)
  }, [initialCards])

  const retryIncorrect = useCallback(() => {
    if (!results) return

    const incorrectIds = new Set(
      results
        .filter((result) => !result.isCorrect)
        .map((result) => result.flashcardId)
    )

    const missedCards = initialCards.filter((card) => incorrectIds.has(card.id))

    setCards(missedCards)
    setResults(null)
    setSessionVersion((version) => version + 1)
  }, [initialCards, results])

  return {
    cards,
    results,
    sessionVersion,
    completeSession,
    restart,
    retryIncorrect,
  }
}
