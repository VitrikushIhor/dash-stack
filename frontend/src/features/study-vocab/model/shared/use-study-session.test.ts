import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type StudyCard, VocabProgressStatus } from '@/entities/vocab'
import { useStudySession } from './use-study-session'
import { useSubmitProgress } from './use-submit-progress'

vi.mock('./use-submit-progress', () => ({
  useSubmitProgress: vi.fn(),
}))

const mockCards: StudyCard[] = [
  {
    id: 'c1',
    deckId: 'd1',
    term: 'Term 1',
    definition: 'Def 1',
    example: null,
    imageUrl: null,
    position: 0,
    progress: {
      id: 'p1',
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
    id: 'c2',
    deckId: 'd1',
    term: 'Term 2',
    definition: 'Def 2',
    example: null,
    imageUrl: null,
    position: 1,
    progress: {
      id: 'p2',
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

describe('useStudySession', () => {
  const submitProgressMock = vi.fn()

  beforeEach(() => {
    vi.mocked(useSubmitProgress).mockReturnValue({
      submitProgress: submitProgressMock,
      isSubmitting: false,
    } as unknown as ReturnType<typeof useSubmitProgress>)
  })

  it('handles completeSession, restart, and retryIncorrect flows', () => {
    const { result } = renderHook(() =>
      useStudySession({
        deckId: 'd1',
        initialCards: mockCards,
      })
    )

    expect(result.current.cards).toHaveLength(2)
    expect(result.current.results).toBeNull()
    expect(result.current.sessionVersion).toBe(0)

    const sessionResults = [
      { flashcardId: 'c1', isCorrect: true },
      { flashcardId: 'c2', isCorrect: false },
    ]

    act(() => {
      result.current.completeSession(sessionResults)
    })

    expect(result.current.results).toEqual(sessionResults)
    expect(submitProgressMock).toHaveBeenCalledWith('d1', sessionResults)

    act(() => {
      result.current.retryIncorrect()
    })

    expect(result.current.cards).toEqual([mockCards[1]])
    expect(result.current.results).toBeNull()
    expect(result.current.sessionVersion).toBe(1)

    act(() => {
      result.current.restart()
    })

    expect(result.current.cards).toEqual(mockCards)
    expect(result.current.results).toBeNull()
    expect(result.current.sessionVersion).toBe(2)
  })
})
