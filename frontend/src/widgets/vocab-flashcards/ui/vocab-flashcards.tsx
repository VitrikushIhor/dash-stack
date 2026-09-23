'use client'

import { type Deck } from '@/entities/deck'
import { type StudyCard, StudyMode } from '@/entities/vocab'
import {
  FlashcardPlayer,
  StudyEmptyState,
  StudySessionContainer,
  StudySummary,
  useFlashcardSession,
} from '@/features/study-vocab'

interface VocabFlashcardsProps {
  deck: Deck
  initialCards: StudyCard[]
}

export function VocabFlashcards({ deck, initialCards }: VocabFlashcardsProps) {
  const {
    cards,
    results,
    sessionVersion,
    completeSession,
    retryIncorrect,
    restart,
    isSubmitting,
    progressStatus,
    progressError,
    retryProgress,
  } = useFlashcardSession({
    deckId: deck.id,
    initialCards,
  })

  if (results) {
    return (
      <StudySummary
        kind={StudyMode.FLASHCARDS}
        results={results}
        onRetryIncorrect={retryIncorrect}
        onRestart={restart}
        isSubmitting={isSubmitting}
        progressStatus={progressStatus}
        progressError={progressError}
        onRetryProgress={retryProgress}
      />
    )
  }

  if (cards.length === 0) {
    return (
      <StudyEmptyState
        title='No cards match these filters'
        description='Try All cards or change the study filters. Unseen cards are not due until you review them.'
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
