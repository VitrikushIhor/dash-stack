'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { type StudyCard } from '@/entities/vocab'
import { type FlashcardResult } from '../shared/types'

export function useFlashcards(
  cards: StudyCard[],
  onComplete: (results: FlashcardResult[]) => void
) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const resultsRef = useRef<FlashcardResult[]>([])
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const currentCard = cards[currentIndex]
  const isFinished = cards.length > 0 && currentIndex >= cards.length
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      if (!currentCard) return

      const newResults = [
        ...resultsRef.current,
        { flashcardId: currentCard.id, isCorrect },
      ]
      resultsRef.current = newResults

      setIsFlipped(false)
      
      if (currentIndex + 1 >= cards.length) {
        onCompleteRef.current(newResults)
      } else {
        setCurrentIndex((prev) => prev + 1)
      }
    },
    [currentCard, currentIndex, cards.length]
  )

  return {
    currentCard,
    isFlipped,
    progress,
    flipCard,
    handleAnswer,
    isFinished,
    isSessionLoaded: true,
    totalCards: cards.length,
    currentIndex,
  }
}

