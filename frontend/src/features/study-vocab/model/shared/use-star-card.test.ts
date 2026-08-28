import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useStarCard } from './use-star-card'

const mockExecute = vi.fn()

vi.mock('@/shared/lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/lib')>()
  return {
    ...actual,
    useAction: () => ({
      execute: mockExecute,
    }),
  }
})

describe('useStarCard', () => {
  it('toggles star optimistically on success', async () => {
    mockExecute.mockResolvedValueOnce({ isStarred: true })

    const { result } = renderHook(() => useStarCard('deck-1', 'card-1', false))

    expect(result.current.isStarred).toBe(false)

    await act(async () => {
      await result.current.toggleStar()
    })

    expect(result.current.isStarred).toBe(true)
    expect(mockExecute).toHaveBeenCalledWith({
      deckId: 'deck-1',
      cardId: 'card-1',
      isStarred: true,
    })
  })

  it('rolls back to previous state if action fails', async () => {
    mockExecute.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useStarCard('deck-1', 'card-1', false))

    expect(result.current.isStarred).toBe(false)

    await act(async () => {
      await result.current.toggleStar()
    })

    expect(result.current.isStarred).toBe(false)
  })

  it('syncs state when initialIsStarred prop changes', () => {
    const { result, rerender } = renderHook(
      ({ initialStarred }) => useStarCard('deck-1', 'card-1', initialStarred),
      {
        initialProps: { initialStarred: false },
      }
    )

    expect(result.current.isStarred).toBe(false)

    rerender({ initialStarred: true })

    expect(result.current.isStarred).toBe(true)
  })
})
