import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { type Flashcard } from '@/entities/deck'
import { useFlashcards } from './use-flashcards'

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('useFlashcards', () => {
  it('should initialize with default empty cards if initialCards is empty', () => {
    const { result } = renderHook(() => useFlashcards('deck-1', []))

    expect(result.current.cards).toHaveLength(2)
    expect(result.current.cards[0].id).toBe('temp-init-1')
    expect(result.current.cards[1].id).toBe('temp-init-2')
    expect(result.current.deletedCardIds).toEqual([])
  })

  it('should initialize with provided initialCards', () => {
    const initialCards: Flashcard[] = [
      {
        id: 'card-1',
        deckId: 'deck-1',
        term: 'eloquent',
        definition: 'fluent or persuasive in speaking or writing',
        position: 0,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ]

    const { result } = renderHook(() => useFlashcards('deck-1', initialCards))

    expect(result.current.cards).toHaveLength(1)
    expect(result.current.cards[0].term).toBe('eloquent')
  })

  it('should add a new card with temporary ID', () => {
    const { result } = renderHook(() => useFlashcards('deck-1', []))

    act(() => {
      result.current.handleAddCard()
    })

    expect(result.current.cards).toHaveLength(3)
    expect(result.current.cards[2].id).toMatch(/^temp-/)
  })

  it('should update a card field', () => {
    const { result } = renderHook(() => useFlashcards('deck-1', []))

    act(() => {
      result.current.handleCardChange('temp-init-1', 'term', 'resilience')
    })

    expect(result.current.cards[0].term).toBe('resilience')
  })

  it('should remove a temporary card without adding to deletedCardIds', () => {
    const { result } = renderHook(() => useFlashcards('deck-1', []))

    act(() => {
      result.current.handleCardDelete('temp-init-1')
    })

    expect(result.current.cards).toHaveLength(1)
    expect(result.current.deletedCardIds).toHaveLength(0)
  })

  it('should remove an existing card and add its ID to deletedCardIds buffer', () => {
    const initialCards: Flashcard[] = [
      {
        id: 'persisted-card-1',
        deckId: 'deck-1',
        term: 'ephemeral',
        definition: 'short-lived',
        position: 0,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ]

    const { result } = renderHook(() => useFlashcards('deck-1', initialCards))

    act(() => {
      result.current.handleCardDelete('persisted-card-1')
    })

    expect(result.current.cards).toHaveLength(0)
    expect(result.current.deletedCardIds).toEqual(['persisted-card-1'])
  })
})
