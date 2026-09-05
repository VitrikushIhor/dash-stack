'use client'

import React, { useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import { type Deck } from '@/entities/deck'
import { type StudyCard } from '@/entities/vocab'
import {
  StudySessionContainer,
  StudySessionSkeleton,
  StudySummary,
  useSubmitMatchScore,
} from '@/features/study-vocab'

const MatchPlayer = dynamic(
  () => import('@/features/study-vocab').then((mod) => mod.MatchPlayer),
  {
    ssr: false,
    loading: () => <StudySessionSkeleton />,
  }
)

interface MatchViewProps {
  deck: Deck
  initialCards: StudyCard[]
}

export function MatchView({ deck, initialCards }: MatchViewProps) {
  const [durationMs, setDurationMs] = useState<number | null>(null)
  const [restartCount, setRestartCount] = useState(0)
  const { submitMatchScore, isSubmitting } = useSubmitMatchScore()

  const handleComplete = useCallback(
    (timeMs: number) => {
      setDurationMs(timeMs)
      submitMatchScore(deck.id, timeMs)
    },
    [deck.id, submitMatchScore]
  )

  const handleRestart = () => {
    setDurationMs(null)
    setRestartCount((prev) => prev + 1)
  }

  if (durationMs !== null) {
    return (
      <StudySummary
        kind='match'
        matchDurationMs={durationMs}
        onRestart={handleRestart}
        isSubmitting={isSubmitting}
      />
    )
  }

  return (
    <StudySessionContainer>
      <MatchPlayer
        key={`${deck.id}-${restartCount}`}
        cards={initialCards}
        onComplete={handleComplete}
      />
    </StudySessionContainer>
  )
}
