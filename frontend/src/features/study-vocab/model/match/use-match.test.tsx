import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MATCH_DELAY_MS, WRONG_MATCH_DELAY_MS } from '../shared/constants'
import { GAME_STATUS } from './game/match-game-reducer'
import { useMatch } from './game/use-match'

const cards = Array.from({ length: 6 }, (_, index) => ({
  id: `card-${index}`,
  deckId: 'deck-1',
  term: `Term ${index}`,
  definition: `Definition ${index}`,
}))

describe('useMatch', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should_clear_pair_error_when_a_failed_pending_pair_is_deselected', async () => {
    vi.useFakeTimers()
    const onPairMatched = vi.fn().mockResolvedValue(false)
    const { result } = renderHook(() => useMatch(cards, vi.fn(), onPairMatched))
    const [firstTile, secondTile] = result.current.gameState.tiles.filter(
      (tile) => tile.cardId === cards[0].id
    )

    act(() => {
      result.current.handleTileClick(firstTile.id)
      result.current.handleTileClick(secondTile.id)
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(MATCH_DELAY_MS)
    })
    expect(result.current.pairError).toBe(true)

    act(() => {
      result.current.handleTileClick(firstTile.id)
    })

    const gameState = result.current.gameState

    if (gameState.type !== GAME_STATUS.PLAYING) {
      throw new Error('Expected the game to remain in the playing state')
    }
    expect(gameState.selectedTileIds).toEqual([secondTile.id])
    expect(result.current.pairError).toBe(false)
  })

  it('should_retry_a_wrong_pair_with_the_same_attempt_id', async () => {
    vi.useFakeTimers()
    const saveAttempt = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
    const { result } = renderHook(() => useMatch(cards, vi.fn(), saveAttempt))
    const firstTile = result.current.gameState.tiles.find(
      (tile) => tile.cardId === cards[0].id && tile.type === 'term'
    )
    const secondTile = result.current.gameState.tiles.find(
      (tile) => tile.cardId === cards[1].id && tile.type === 'definition'
    )

    if (!firstTile || !secondTile) throw new Error('Expected wrong-pair tiles')

    act(() => {
      result.current.handleTileClick(firstTile.id)
      result.current.handleTileClick(secondTile.id)
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(WRONG_MATCH_DELAY_MS)
    })
    expect(result.current.pairError).toBe(true)

    act(() => result.current.retryPair())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(WRONG_MATCH_DELAY_MS)
    })

    expect(saveAttempt).toHaveBeenCalledTimes(2)
    expect(saveAttempt.mock.calls[0][0].attemptId).toBe(
      saveAttempt.mock.calls[1][0].attemptId
    )
  })
  it('should_not_submit_twice_when_retry_is_clicked_while_pair_is_pending', async () => {
    vi.useFakeTimers()
    let resolvePair: ((saved: boolean) => void) | undefined
    const saveAttempt = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolvePair = resolve
        })
    )
    const { result } = renderHook(() => useMatch(cards, vi.fn(), saveAttempt))
    const [first, second] = result.current.gameState.tiles.filter(
      (tile) => tile.cardId === cards[0].id
    )
    act(() => {
      result.current.handleTileClick(first.id)
      result.current.handleTileClick(second.id)
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(MATCH_DELAY_MS)
    })
    act(() => result.current.retryPair())
    await act(async () => {
      await vi.advanceTimersByTimeAsync(MATCH_DELAY_MS)
    })
    expect(saveAttempt).toHaveBeenCalledOnce()
    await act(async () => {
      resolvePair?.(true)
    })
  })
})
