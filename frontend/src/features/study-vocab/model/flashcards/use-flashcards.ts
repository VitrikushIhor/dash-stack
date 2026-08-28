'use client'

import { useCallback, useState } from 'react'
import { type StudyCard } from '@/entities/vocab'
import { type FlashcardResult } from '../shared/types'
import { useCardProgression } from '../shared/use-card-progression'

export function useFlashcards(
  cards: StudyCard[],
  onComplete: (results: FlashcardResult[]) => void
) {
  const [isFlipped, setIsFlipped] = useState(false)
  const progression = useCardProgression(cards, onComplete)

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      progression.handleAnswer(isCorrect, () => {
        setIsFlipped(false)
      })
    },
    [progression]
  )

  return {
    ...progression,
    isFlipped,
    flipCard,
    handleAnswer,
  }
}
