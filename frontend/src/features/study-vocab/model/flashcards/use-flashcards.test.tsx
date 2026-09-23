import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { type StudyCard, VocabProgressStatus } from '@/entities/vocab'
import { useFlashcards } from './game/use-flashcards'

const cards: StudyCard[] = ['one', 'two', 'three'].map((term, position) => ({
  id: `card-${position + 1}`,
  deckId: 'deck-1',
  term,
  definition: `Definition ${term}`,
  example: null,
  imageUrl: null,
  position,
  progress: {
    id: null,
    status: VocabProgressStatus.NEW,
    box: 1,
    isStarred: false,
    correctStreak: 0,
    correctCount: 0,
    incorrectCount: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
  },
}))

describe('useFlashcards', () => {
  it('resets progression when the study card session changes', () => {
    const onComplete = vi.fn()
    const { result, rerender } = renderHook(
      ({ studyCards }) => useFlashcards(studyCards, onComplete),
      { initialProps: { studyCards: cards } }
    )

    act(() => result.current.handleAnswer(true))
    const replacementCards = cards.map((card) => ({
      ...card,
      deckId: 'deck-2',
      id: `replacement-${card.id}`,
    }))

    rerender({ studyCards: replacementCards })

    expect(result.current.currentCard?.id).toBe('replacement-card-1')
    expect(result.current.results).toEqual([])
    expect(result.current.progress).toBe(0)
    expect(result.current.isFlipped).toBe(false)
  })

  it('navigates without recording an answer', () => {
    const { result } = renderHook(() => useFlashcards(cards, vi.fn()))

    act(() => result.current.goToNextCard())
    expect(result.current.currentCard?.id).toBe('card-2')
    expect(result.current.results).toEqual([])

    act(() => result.current.goToPreviousCard())
    expect(result.current.currentCard?.id).toBe('card-1')
    expect(result.current.results).toEqual([])
  })

  it('does not record the same card twice after navigation', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useFlashcards(cards, onComplete))

    act(() => result.current.handleAnswer(true))
    act(() => result.current.goToPreviousCard())
    act(() => result.current.handleAnswer(false))

    expect(result.current.results).toEqual([
      { flashcardId: 'card-1', isCorrect: true },
    ])
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('wraps to an unanswered card skipped by navigation', () => {
    const { result } = renderHook(() => useFlashcards(cards, vi.fn()))

    act(() => result.current.handleAnswer(true))
    act(() => result.current.goToNextCard())
    expect(result.current.currentCard?.id).toBe('card-3')

    act(() => result.current.handleAnswer(true))

    expect(result.current.currentCard?.id).toBe('card-2')
  })

  it('shuffles the current selection without losing recorded answers', () => {
    const { result } = renderHook(() => useFlashcards(cards, vi.fn()))

    act(() => result.current.handleAnswer(true))
    const beforeShuffleIds = result.current.allCards.map((card) => card.id)
    const random = vi.spyOn(Math, 'random').mockReturnValue(0)

    act(() => result.current.shuffleCards())
    random.mockRestore()

    expect(result.current.allCards.map((card) => card.id)).not.toEqual(
      beforeShuffleIds
    )
    expect(result.current.results).toEqual([
      { flashcardId: 'card-1', isCorrect: true },
    ])
  })

  it('completes once with results keyed by flashcard id after a shuffle', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useFlashcards(cards, onComplete))

    act(() => result.current.handleAnswer(true))
    act(() => result.current.shuffleCards())
    act(() => result.current.handleAnswer(false))
    act(() => result.current.handleAnswer(true))
    act(() => result.current.handleAnswer(false))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(
      new Set(
        onComplete.mock.calls[0]?.[0].map(
          (item: { flashcardId: string }) => item.flashcardId
        )
      )
    ).toEqual(new Set(cards.map((card) => card.id)))
  })
})
