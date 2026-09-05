'use client'

import { type Deck } from '@/entities/deck'
import { type StudyCard } from '@/entities/vocab'
import {
  FlashcardPlayer,
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
