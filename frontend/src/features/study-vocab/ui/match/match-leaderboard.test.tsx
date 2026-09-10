import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MatchLeaderboard } from './match-leaderboard'

describe('MatchLeaderboard', () => {
  it('should_render_ranked_users_and_current_user_best', () => {
    const entry = {
      id: 'result-1',
      deckId: 'deck-1',
      userId: 'user-1',
      durationMs: 14500,
      cardCount: 6,
      createdAt: '2026-09-09T10:00:14.500Z',
      user: {
        id: 'user-1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        avatar: null,
      },
    }
    render(
      <MatchLeaderboard
        board={{
          data: [entry],
          currentUserBest: entry,
          meta: {
            total: 1,
            lastPage: 1,
            currentPage: 1,
            perPage: 10,
            prev: null,
            next: null,
          },
        }}
      />
    )

    expect(
      screen.getByRole('heading', { name: 'Leaderboard' })
    ).toBeInTheDocument()
    expect(screen.getByRole('list')).toHaveTextContent('Ada Lovelace')
    expect(screen.getByText(/Your best:/)).toHaveTextContent('14.5')
  })

  it('should_continue_rank_numbers_on_later_pages', () => {
    const entry = {
      id: 'r',
      deckId: 'd',
      userId: 'u',
      durationMs: 1000,
      cardCount: 6,
      createdAt: '',
      user: { id: 'u', firstName: 'Ada', lastName: null, avatar: null },
    }
    render(
      <MatchLeaderboard
        board={{
          data: [entry],
          currentUserBest: null,
          meta: {
            total: 20,
            lastPage: 2,
            currentPage: 2,
            perPage: 10,
            prev: 1,
            next: null,
          },
        }}
      />
    )
    expect(screen.getByRole('list')).toHaveTextContent('11.')
  })
})
