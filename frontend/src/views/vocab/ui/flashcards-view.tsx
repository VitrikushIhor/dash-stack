'use client'

import { type Deck } from '@/entities/deck'
import { type StudyCard } from '@/entities/vocab'
import {
  FlashcardPlayer,
  StudyEmptyState,
  StudySessionContainer,
  StudySummary,
  useStudySession,
} from '@/features/study-vocab'

interface FlashcardsViewProps {
  deck: Deck
  initialCards: StudyCard[]
}

export function FlashcardsView({ deck, initialCards }: FlashcardsViewProps) {
  const {
    cards,
    results,
    sessionVersion,
    completeSession,
    retryIncorrect,
    restart,
    isSubmitting,
  } = useStudySession({
    deckId: deck.id,
    initialCards,
  })

  if (results) {
    return (
      <StudySummary
        kind='cards'
        results={results}
        onRetryIncorrect={retryIncorrect}
        onRestart={restart}
        isSubmitting={isSubmitting}
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
