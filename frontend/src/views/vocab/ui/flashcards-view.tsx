'use client'

import { useCallback } from 'react'
import { type Deck } from '@/entities/deck'
import { type StudyCard } from '@/entities/vocab'
import {
  FlashcardPlayer,
  type StudyAnswerResult,
  StudySessionContainer,
  StudySummary,
  useStudySession,
  useSubmitProgress,
} from '@/features/study-vocab'

interface FlashcardsViewProps {
  deck: Deck
  initialCards: StudyCard[]
}

export function FlashcardsView({ deck, initialCards }: FlashcardsViewProps) {
  const { submitProgress, isSubmitting } = useSubmitProgress()

  const handleSubmit = useCallback(
    (results: StudyAnswerResult[]) => {
      submitProgress(deck.id, results)
    },
    [deck.id, submitProgress]
  )

  const {
    cards,
    results,
    sessionVersion,
    completeSession,
    retryIncorrect,
    restart,
  } = useStudySession({
    initialCards,
    onComplete: handleSubmit,
  })

  if (results) {
    return (
      <StudySummary
        deckId={deck.id}
        results={results}
        onRetryIncorrect={retryIncorrect}
        onRestart={restart}
        isSubmitting={isSubmitting}
      />
    )
  }

  return (
    <StudySessionContainer>
      <FlashcardPlayer
        key={sessionVersion}
        cards={cards}
        onComplete={completeSession}
      />
    </StudySessionContainer>
  )
}
