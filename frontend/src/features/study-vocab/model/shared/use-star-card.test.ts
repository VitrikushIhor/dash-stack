import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type User, useCurrentUser } from '@/entities/user'
import { useStarCard } from './use-star-card'

const mockExecute = vi.fn()
const refetchMock = vi.fn()
const mockUser: User = {
  id: 'user-1',
  firstName: 'Alice',
  email: 'alice@example.com',
}

vi.mock('@/shared/lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/lib')>()
  return {
    ...actual,
    useAction: () => ({
      execute: mockExecute,
    }),
  }
})

vi.mock('@/entities/user', () => ({
  useCurrentUser: vi.fn(),
}))

describe('useStarCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    refetchMock.mockResolvedValue({ data: undefined })
    vi.mocked(useCurrentUser).mockReturnValue({
      data: mockUser,
      refetch: refetchMock,
    } as Partial<ReturnType<typeof useCurrentUser>> as ReturnType<
      typeof useCurrentUser
    >)
  })

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

  it('does not persist or update a star for a guest', async () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      data: null,
      refetch: refetchMock,
    } as unknown as ReturnType<typeof useCurrentUser>)

    const { result } = renderHook(() => useStarCard('deck-1', 'card-1', false))

    await act(async () => {
      await result.current.toggleStar()
    })

    expect(result.current.isStarred).toBe(false)
    expect(mockExecute).not.toHaveBeenCalled()
    expect(refetchMock).not.toHaveBeenCalled()
  })

  it('delegates authentication to the action immediately when user state is unknown', async () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      data: undefined,
      refetch: refetchMock,
    } as Partial<ReturnType<typeof useCurrentUser>> as ReturnType<
      typeof useCurrentUser
    >)
    mockExecute.mockResolvedValueOnce({ isStarred: true })

    const { result } = renderHook(() => useStarCard('deck-1', 'card-1', false))

    await act(async () => {
      const submission = result.current.toggleStar()
      expect(mockExecute).toHaveBeenCalled()
      await submission
    })

    expect(mockExecute).toHaveBeenCalledWith({
      deckId: 'deck-1',
      cardId: 'card-1',
      isStarred: true,
    })
    expect(refetchMock).not.toHaveBeenCalled()
  })
})
