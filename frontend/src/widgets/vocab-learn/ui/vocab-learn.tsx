'use client'

import dynamic from 'next/dynamic'
import { type Deck } from '@/entities/deck'
import { type StudyCard } from '@/entities/vocab'
import {
  StudySessionContainer,
  StudySessionSkeleton,
} from '@/features/study-vocab'

const LearnPlayer = dynamic(
  () => import('@/features/study-vocab').then((mod) => mod.AdaptiveLearnPlayer),
  {
    ssr: false,
    loading: () => <StudySessionSkeleton />,
  }
)

interface VocabLearnProps {
  deck: Deck
  initialCards: StudyCard[]
  sessionKey: string
}

export function VocabLearn({
  deck,
  initialCards,
  sessionKey,
}: VocabLearnProps) {
  return (
    <StudySessionContainer>
      <LearnPlayer
        deckId={deck.id}
        cards={initialCards}
        sessionKey={sessionKey}
      />
    </StudySessionContainer>
  )
}
