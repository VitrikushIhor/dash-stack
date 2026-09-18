import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
  afterEach(() => vi.useRealTimers())
  it('should_ignore_rapid_toggles_after_a_fast_response', async () => {
    vi.useFakeTimers()
    mockExecute.mockResolvedValue({ isStarred: true })
    const { result } = renderHook(() => useStarCard('card-1', false))
    await act(async () => {
      await result.current.toggleStar()
    })
    await act(async () => {
      await result.current.toggleStar()
    })
    expect(mockExecute).toHaveBeenCalledTimes(1)
    expect(result.current.isPending).toBe(false)
    expect(result.current.isDisabled).toBe(true)
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.isDisabled).toBe(false)
    await act(async () => {
      await result.current.toggleStar()
    })
    expect(mockExecute).toHaveBeenCalledTimes(2)
  })
  it('should_ignore_repeated_toggles_until_request_settles', async () => {
    vi.useFakeTimers()
    let finish: (value: { isStarred: boolean }) => void = () => undefined
    mockExecute.mockImplementationOnce(
      () =>
        new Promise<{ isStarred: boolean }>((resolve) => {
          finish = resolve
        })
    )
    const { result } = renderHook(() => useStarCard('card-1', false))
    let submission: Promise<void>
    act(() => {
      submission = result.current.toggleStar()
      void result.current.toggleStar()
    })
    expect(mockExecute).toHaveBeenCalledTimes(1)
    expect(result.current.isPending).toBe(true)
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.isDisabled).toBe(true)
    await act(async () => {
      await result.current.toggleStar()
    })
    expect(mockExecute).toHaveBeenCalledTimes(1)
    await act(async () => {
      finish({ isStarred: true })
      await submission
    })
    expect(result.current.isPending).toBe(false)
    expect(result.current.isDisabled).toBe(false)
  })
  it('should_restore_last_saved_star_when_a_later_request_fails', async () => {
    vi.useFakeTimers()
    mockExecute
      .mockResolvedValueOnce({ isStarred: true })
      .mockResolvedValueOnce(undefined)
    const { result } = renderHook(() => useStarCard('card-1', false))
    await act(async () => {
      await result.current.toggleStar()
    })
    act(() => vi.advanceTimersByTime(1000))
    await act(async () => {
      await result.current.toggleStar()
    })
    expect(result.current.isStarred).toBe(true)
    expect(result.current.isPending).toBe(false)
    expect(mockExecute).toHaveBeenCalledTimes(2)
  })
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

  it('should_reconcile_with_server_state_when_response_differs', async () => {
    mockExecute.mockResolvedValueOnce({ isStarred: false })
    const { result } = renderHook(() => useStarCard('card-1', false))
    await act(async () => {
      await result.current.toggleStar()
    })
    expect(result.current.isStarred).toBe(false)
  })

  it('toggles star optimistically on success', async () => {
    mockExecute.mockResolvedValueOnce({ isStarred: true })

    const { result } = renderHook(() => useStarCard('card-1', false))

    expect(result.current.isStarred).toBe(false)

    await act(async () => {
      await result.current.toggleStar()
    })

    expect(result.current.isStarred).toBe(true)
    expect(mockExecute).toHaveBeenCalledWith({
      cardId: 'card-1',
      isStarred: true,
    })
  })

  it('rolls back to previous state if action fails', async () => {
    mockExecute.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useStarCard('card-1', false))

    expect(result.current.isStarred).toBe(false)

    await act(async () => {
      await result.current.toggleStar()
    })

    expect(result.current.isStarred).toBe(false)
  })

  it('syncs state when initialIsStarred prop changes', () => {
    const { result, rerender } = renderHook(
      ({ initialStarred }) => useStarCard('card-1', initialStarred),
      {
        initialProps: { initialStarred: false },
      }
    )

    expect(result.current.isStarred).toBe(false)

    rerender({ initialStarred: true })

    expect(result.current.isStarred).toBe(true)
  })

  it('keeps an optimistic star when navigating away and back to the card', async () => {
    vi.useFakeTimers()
    mockExecute.mockResolvedValue({ isStarred: true })
    const { result, rerender } = renderHook(
      ({ cardId, initialStarred }) =>
        useStarCard(cardId, initialStarred),
      { initialProps: { cardId: 'card-1', initialStarred: false } }
    )

    await act(async () => {
      await result.current.toggleStar()
    })
    rerender({ cardId: 'card-2', initialStarred: false })
    rerender({ cardId: 'card-1', initialStarred: false })

    expect(result.current.isStarred).toBe(true)
    act(() => vi.advanceTimersByTime(1000))
    await act(async () => {
      await result.current.toggleStar()
    })
    expect(mockExecute).toHaveBeenLastCalledWith({
      cardId: 'card-1',
      isStarred: false,
    })
  })

  it('does not persist or update a star for a guest', async () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      data: null,
      refetch: refetchMock,
    } as unknown as ReturnType<typeof useCurrentUser>)

    const { result } = renderHook(() => useStarCard('card-1', false))

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

    const { result } = renderHook(() => useStarCard('card-1', false))

    await act(async () => {
      const submission = result.current.toggleStar()
      expect(mockExecute).toHaveBeenCalled()
      await submission
    })

    expect(mockExecute).toHaveBeenCalledWith({
      cardId: 'card-1',
      isStarred: true,
    })
    expect(refetchMock).not.toHaveBeenCalled()
  })
})
