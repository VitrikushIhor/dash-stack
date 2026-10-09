import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GAME_STATUS } from '../../model/match/game/match-game-reducer'
import { useMatch } from '../../model/match/game/use-match'
import { MatchPlayer } from './match-player'

vi.mock('../../model/match/game/use-match', () => ({ useMatch: vi.fn() }))

const cards = Array.from({ length: 6 }, (_, index) => ({
  id: `card-${index}`,
  deckId: 'deck-1',
  term: `Term ${index}`,
  definition: `Definition ${index}`,
}))

describe('MatchPlayer', () => {
  it('should_show_saving_feedback_as_soon_as_the_last_pair_is_matched', () => {
    vi.mocked(useMatch).mockReturnValue({
      gameState: {
        type: GAME_STATUS.PLAYING,
        tiles: [],
        selectedTileIds: [],
        wrongMatchIds: [],
        startTime: 1_000,
        penaltyTime: 0,
        endTime: 2_000,
      },
      handleTileClick: vi.fn(),
      pairError: false,
      retryPair: vi.fn(),
    })

    render(
      <MatchPlayer
        cards={cards}
        onComplete={vi.fn()}
        onPairMatched={vi.fn().mockResolvedValue(true)}
      />
    )

    expect(screen.getByText('Saving Result...')).toBeInTheDocument()
    expect(
      screen.getByText('Processing your match game score.')
    ).toBeInTheDocument()
  })
})
