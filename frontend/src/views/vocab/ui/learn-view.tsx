'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { type Deck } from '@/entities/deck'
import { type StudyCard } from '@/entities/vocab'
import {
  LearnModeSelect,
  type LearnQuestionType,
  StudyEmptyState,
  StudySessionContainer,
  StudySessionSkeleton,
  StudySummary,
  useStudySession,
} from '@/features/study-vocab'

const LearnPlayer = dynamic(
  () => import('@/features/study-vocab').then((mod) => mod.LearnPlayer),
  {
    ssr: false,
    loading: () => <StudySessionSkeleton />,
  }
)

interface LearnViewProps {
  deck: Deck
  initialCards: StudyCard[]
}

export function LearnView({ deck, initialCards }: LearnViewProps) {
  const [mode, setMode] = useState<LearnQuestionType | null>(null)
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

  if (!mode) {
    return (
      <StudySessionContainer>
        <LearnModeSelect
          deck={deck}
          cardsCount={cards.length}
          onSelectMode={setMode}
        />
      </StudySessionContainer>
    )
  }

  return (
    <StudySessionContainer>
      <LearnPlayer
        key={`${sessionVersion}-${mode}`}
        cards={cards}
        mode={mode}
        onComplete={completeSession}
      />
    </StudySessionContainer>
  )
}
