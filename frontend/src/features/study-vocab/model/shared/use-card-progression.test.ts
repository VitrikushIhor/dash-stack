import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { type StudyCard, VocabProgressStatus } from '@/entities/vocab'
import { useCardProgression } from './use-card-progression'

const mockCards: StudyCard[] = [
  {
    id: 'card-1',
    deckId: 'deck-1',
    term: 'Term 1',
    definition: 'Def 1',
    example: null,
    imageUrl: null,
    position: 0,
    progress: {
      id: 'prog-1',
      isStarred: false,
      box: 1,
      correctStreak: 0,
      correctCount: 0,
      incorrectCount: 0,
      lastReviewedAt: null,
      nextReviewAt: new Date().toISOString(),
      status: VocabProgressStatus.LEARNING,
    },
  },
  {
    id: 'card-2',
    deckId: 'deck-1',
    term: 'Term 2',
    definition: 'Def 2',
    example: null,
    imageUrl: null,
    position: 1,
    progress: {
      id: 'prog-2',
      isStarred: false,
      box: 1,
      correctStreak: 0,
      correctCount: 0,
      incorrectCount: 0,
      lastReviewedAt: null,
      nextReviewAt: new Date().toISOString(),
      status: VocabProgressStatus.LEARNING,
    },
  },
]

describe('useCardProgression', () => {
  it('initializes with first card and 0 index', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useCardProgression(mockCards, onComplete)
    )

    expect(result.current.currentIndex).toBe(0)
    expect(result.current.currentCard).toEqual(mockCards[0])
    expect(result.current.totalCards).toBe(2)
    expect(result.current.isFinished).toBe(false)
    expect(result.current.progress).toBe(50)
  })

  it('advances index on handleAnswer and calls onComplete on final card', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useCardProgression(mockCards, onComplete)
    )

    act(() => {
      result.current.handleAnswer(true)
    })

    expect(result.current.currentIndex).toBe(1)
    expect(result.current.currentCard).toEqual(mockCards[1])
    expect(result.current.progress).toBe(100)
    expect(onComplete).not.toHaveBeenCalled()

    act(() => {
      result.current.handleAnswer(false)
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith([
      { flashcardId: 'card-1', isCorrect: true },
      { flashcardId: 'card-2', isCorrect: false },
    ])
  })

  it('handles empty cards array gracefully', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useCardProgression([], onComplete))

    expect(result.current.currentIndex).toBe(0)
    expect(result.current.currentCard).toBeUndefined()
    expect(result.current.totalCards).toBe(0)
    expect(result.current.progress).toBe(0)
    expect(result.current.isFinished).toBe(false)
  })
})
