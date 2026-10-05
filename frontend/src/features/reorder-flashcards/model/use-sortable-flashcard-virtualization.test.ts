import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSortableFlashcardVirtualization } from './use-sortable-flashcard-virtualization'

const { useVirtualizerMock } = vi.hoisted(() => ({
  useVirtualizerMock: vi.fn(),
}))

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: useVirtualizerMock,
}))

describe('useSortableFlashcardVirtualization', () => {
  beforeEach(() => vi.clearAllMocks())

  it('configures virtualization from stable card IDs and list settings', () => {
    useVirtualizerMock.mockReturnValue({ virtualItems: [] })
    const cards = Array.from({ length: 51 }, (_, index) => ({
      id: `card-${index}`,
    }))

    const { result } = renderHook(() =>
      useSortableFlashcardVirtualization(cards)
    )
    const options = useVirtualizerMock.mock.calls[0]?.[0]

    expect(result.current.shouldVirtualize).toBe(true)
    expect(options).toMatchObject({
      count: 51,
      enabled: true,
      overscan: 5,
    })
    expect(options.getItemKey(7)).toBe('card-7')
    expect(options.estimateSize()).toBe(260)
  })

  it('keeps virtualization disabled at the threshold', () => {
    useVirtualizerMock.mockReturnValue({ virtualItems: [] })

    const { result } = renderHook(() =>
      useSortableFlashcardVirtualization(
        Array.from({ length: 50 }, (_, index) => ({ id: `card-${index}` }))
      )
    )

    expect(result.current.shouldVirtualize).toBe(false)
    expect(useVirtualizerMock.mock.calls[0]?.[0]).toMatchObject({
      count: 50,
      enabled: false,
    })
  })
})
