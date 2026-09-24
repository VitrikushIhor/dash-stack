import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toggleStarAction } from '@/features/study-vocab/server'
import { useDeckBoard } from './use-deck-board'

vi.mock('@/features/study-vocab/server', () => ({ toggleStarAction: vi.fn() }))

type StarResult = Awaited<ReturnType<typeof toggleStarAction>>

function pendingStar() {
  let resolve!: (result: StarResult) => void
  const promise = new Promise<StarResult>((finish) => {
    resolve = finish
  })

  return { promise, resolve }
}

const success: StarResult = {
  success: true,
  data: { flashcardId: 'card-1', isStarred: true },
}

describe('useDeckBoard star', () => {
  beforeEach(() => vi.resetAllMocks())

  it('should_block_same_card_interactions_when_the_first_request_is_pending', async () => {
    const pending = pendingStar()

    vi.mocked(toggleStarAction).mockReturnValue(pending.promise)
    const { result } = renderHook(() => useDeckBoard('deck-1'))
    const submissions: Promise<unknown>[] = []

    act(() => {
      submissions.push(result.current.toggleStar('card-1', false))
      submissions.push(result.current.toggleStar('card-1', false))
    })
    const submittedCount = vi.mocked(toggleStarAction).mock.calls.length

    await act(async () => {
      pending.resolve(success)
      await Promise.all(submissions)
    })

    expect(submittedCount).toBe(1)
    expect(toggleStarAction).toHaveBeenCalledWith({
      deckId: 'deck-1',
      cardId: 'card-1',
      isStarred: true,
    })
  })

  it('should_allow_another_card_when_one_card_has_a_pending_request', async () => {
    const pending = pendingStar()

    vi.mocked(toggleStarAction).mockReturnValue(pending.promise)
    const { result } = renderHook(() => useDeckBoard('deck-1'))
    const submissions: Promise<unknown>[] = []

    act(() => {
      submissions.push(result.current.toggleStar('card-1', false))
      submissions.push(result.current.toggleStar('card-2', true))
    })
    expect(toggleStarAction).toHaveBeenCalledTimes(2)
    expect(toggleStarAction).toHaveBeenLastCalledWith({
      deckId: 'deck-1',
      cardId: 'card-2',
      isStarred: false,
    })
    await act(async () => {
      pending.resolve(success)
      await Promise.all(submissions)
    })
  })

  it('should_allow_retry_when_a_failed_request_has_settled', async () => {
    vi.mocked(toggleStarAction)
      .mockResolvedValueOnce({ success: false, error: 'Could not save star' })
      .mockResolvedValueOnce(success)
    const { result } = renderHook(() => useDeckBoard('deck-1'))

    await act(async () => {
      expect(await result.current.toggleStar('card-1', false)).toBeUndefined()
    })
    await act(async () => {
      expect(await result.current.toggleStar('card-1', false)).toEqual(
        success.data
      )
    })

    expect(toggleStarAction).toHaveBeenCalledTimes(2)
  })

  it('should_remove_the_optimistic_override_after_the_query_cache_is_reconciled', async () => {
    vi.mocked(toggleStarAction).mockResolvedValue(success)
    const { result } = renderHook(() => useDeckBoard('deck-1'))

    await act(async () => {
      await result.current.toggleStar('card-1', false)
    })
    expect(result.current.starOverrides).toEqual({ 'card-1': true })

    act(() => result.current.clearStarOverride('card-1'))

    expect(result.current.starOverrides).toEqual({})
  })
})
