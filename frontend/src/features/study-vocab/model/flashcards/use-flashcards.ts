'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { type StudyCard } from '@/entities/vocab'
import { type FlashcardResult } from '../shared/types'

export function useFlashcards(
  cards: StudyCard[],
  onComplete: (results: FlashcardResult[]) => void
) {
  const studySessionKey = cards
    .map((card) => `${card.deckId}:${card.id}`)
    .join('|')
  const [isFlipped, setIsFlipped] = useState(false)
  const [orderedCardIds, setOrderedCardIds] = useState(() =>
    cards.map((card) => card.id)
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<FlashcardResult[]>([])
  const [previousStudySessionKey, setPreviousStudySessionKey] =
    useState(studySessionKey)
  const resultsRef = useRef<FlashcardResult[]>([])
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const cardsById = useMemo(
    () => new Map(cards.map((card) => [card.id, card])),
    [cards]
  )

  if (previousStudySessionKey !== studySessionKey) {
    setPreviousStudySessionKey(studySessionKey)
    setOrderedCardIds(cards.map((card) => card.id))
    setCurrentIndex(0)
    setResults([])
    setIsFlipped(false)
  }

  useLayoutEffect(() => {
    resultsRef.current = []
  }, [studySessionKey])

  const allCards = orderedCardIds.flatMap((cardId) => {
    const card = cardsById.get(cardId)
    return card ? [card] : []
  })
  const totalCards = orderedCardIds.length
  const currentCard = cardsById.get(orderedCardIds[currentIndex] ?? '')
  const isFinished = totalCards > 0 && results.length === totalCards
  const progress = totalCards > 0 ? (results.length / totalCards) * 100 : 0

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      if (!currentCard || isFinished) return
      if (
        resultsRef.current.some(
          (result) => result.flashcardId === currentCard.id
        )
      ) {
        return
      }

      const newResults = [
        ...resultsRef.current,
        { flashcardId: currentCard.id, isCorrect },
      ]
      resultsRef.current = newResults
      setResults(newResults)
      setIsFlipped(false)

      if (newResults.length === totalCards) {
        onCompleteRef.current(newResults)
        return
      }

      const answeredCardIds = new Set(
        newResults.map((result) => result.flashcardId)
      )
      for (let offset = 1; offset <= totalCards; offset += 1) {
        const nextIndex = (currentIndex + offset) % totalCards
        const nextCardId = orderedCardIds[nextIndex]
        if (nextCardId && !answeredCardIds.has(nextCardId)) {
          setCurrentIndex(nextIndex)
          return
        }
      }
    },
    [currentCard, currentIndex, isFinished, orderedCardIds, totalCards]
  )

  const goToPreviousCard = useCallback(() => {
    if (!totalCards) return
    setCurrentIndex((index) => (index - 1 + totalCards) % totalCards)
    setIsFlipped(false)
  }, [totalCards])

  const goToNextCard = useCallback(() => {
    if (!totalCards) return
    setCurrentIndex((index) => (index + 1) % totalCards)
    setIsFlipped(false)
  }, [totalCards])

  const shuffleCards = useCallback(() => {
    if (!currentCard || totalCards < 2) return
    const shuffledCardIds = [...orderedCardIds]
    for (let index = shuffledCardIds.length - 1; index > 0; index -= 1) {
      const targetIndex = Math.floor(Math.random() * (index + 1))
      ;[shuffledCardIds[index], shuffledCardIds[targetIndex]] = [
        shuffledCardIds[targetIndex],
        shuffledCardIds[index],
      ]
    }
    setOrderedCardIds(shuffledCardIds)
    setCurrentIndex(
      shuffledCardIds.findIndex((cardId) => cardId === currentCard.id)
    )
    setIsFlipped(false)
  }, [currentCard, orderedCardIds, totalCards])

  return {
    currentCard,
    currentIndex,
    totalCards,
    allCards,
    progress,
    isFinished,
    results,
    isFlipped,
    flipCard,
    handleAnswer,
    goToPreviousCard,
    goToNextCard,
    shuffleCards,
  }
}
