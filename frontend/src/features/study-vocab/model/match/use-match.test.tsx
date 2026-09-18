import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MATCH_DELAY_MS } from '../shared/constants'
import { GAME_STATUS } from './match-game-reducer'
import { useMatch } from './use-match'

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
})
