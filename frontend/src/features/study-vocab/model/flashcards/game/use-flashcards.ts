'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { type StudyCard } from '@/entities/vocab'
import { type FlashcardResult } from '../../shared/types'
import { useController } from '../../shared/use-session-store'
import { useStudyControllerFactories } from '../../study-controllers-provider'

export function useFlashcards(
  cards: StudyCard[],
  onComplete: (results: FlashcardResult[]) => void
) {
  const { flashcardGame } = useStudyControllerFactories()
  const sessionKey = cards.map((card) => `${card.deckId}:${card.id}`).join('|')
  const [store] = useState(() =>
    flashcardGame(
      sessionKey,
      cards.map((card) => card.id)
    )
  )
  const {
    orderedCardIds,
    currentIndex,
    results,
    isFlipped,
    reconcile,
    answer,
    flip,
    navigate,
    shuffle,
  } = useController(store)
  const cardsById = useMemo(
    () => new Map(cards.map((card) => [card.id, card])),
    [cards]
  )

  useEffect(() => {
    reconcile(
      sessionKey,
      cards.map((card) => card.id)
    )
  }, [cards, reconcile, sessionKey])

  const currentCard = cardsById.get(orderedCardIds[currentIndex] ?? '')
  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      if (!currentCard) return
      const completed = answer(currentCard.id, isCorrect)

      if (completed) onComplete(completed)
    },
    [answer, currentCard, onComplete]
  )

  return {
    currentCard,
    currentIndex,
    totalCards: orderedCardIds.length,
    allCards: orderedCardIds.flatMap((id) => {
      const card = cardsById.get(id)

      return card ? [card] : []
    }),
    progress:
      orderedCardIds.length > 0
        ? (results.length / orderedCardIds.length) * 100
        : 0,
    isFinished:
      orderedCardIds.length > 0 && results.length === orderedCardIds.length,
    results,
    isFlipped,
    flipCard: flip,
    handleAnswer,
    goToPreviousCard: () => navigate(-1),
    goToNextCard: () => navigate(1),
    shuffleCards: shuffle,
  }
}
