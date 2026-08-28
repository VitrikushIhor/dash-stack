'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { type StudyCard } from '@/entities/vocab'
import { type StudyAnswerResult } from './types'

export function useCardProgression(
  cards: StudyCard[],
  onComplete: (results: StudyAnswerResult[]) => void
) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const resultsRef = useRef<StudyAnswerResult[]>([])
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const totalCards = cards.length
  const currentCard = cards[currentIndex]
  const isFinished = totalCards > 0 && currentIndex >= totalCards
  const progress = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0

  const handleAnswer = useCallback(
    (isCorrect: boolean, onNext?: () => void) => {
      if (!currentCard) return

      const newResults = [
        ...resultsRef.current,
        { flashcardId: currentCard.id, isCorrect },
      ]
      resultsRef.current = newResults

      onNext?.()

      if (currentIndex + 1 >= totalCards) {
        onCompleteRef.current(newResults)
      } else {
        setCurrentIndex((prev) => prev + 1)
      }
    },
    [currentCard, currentIndex, totalCards]
  )

  return {
    currentCard,
    currentIndex,
    totalCards,
    allCards: cards,
    progress,
    isFinished,
    handleAnswer,
  }
}
