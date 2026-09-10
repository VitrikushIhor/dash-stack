import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Deck } from '@/entities/deck'
import { VocabMatch } from './vocab-match'

const useMatchSession = vi.fn()

vi.mock('next/dynamic', () => ({
  default: () => () => <div>Match player</div>,
}))

vi.mock('@/features/study-vocab', () => ({
  MatchSessionStatus: {
    AUTH_LOADING: 'auth-loading',
    GUEST: 'guest',
    LOADING: 'loading',
    PLAYING: 'playing',
    COMPLETING: 'completing',
    COMPLETE: 'complete',
    ERROR: 'error',
  },
  GuestStudySaveProgressCta: () => <div>Guest CTA</div>,
  MatchLeaderboard: () => <div>Leaderboard</div>,
  StudySessionContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  StudySessionSkeleton: () => <div>Loading</div>,
  StudySummary: () => <div>Match summary</div>,
  useMatchSession: (...args: unknown[]) => useMatchSession(...args),
}))

const deck = {
  id: 'deck-1',
  title: 'Match deck',
} as Deck

const leaderboard = {
  data: { data: [], currentUserBest: null },
  isError: false,
  refetch: vi.fn(),
}

describe('VocabMatch', () => {
  beforeEach(() => vi.clearAllMocks())

  it('should_hide_leaderboard_while_game_is_in_progress', () => {
    useMatchSession.mockReturnValue({
      status: 'playing',
      session: { id: 'session-1', cards: [] },
      completion: null,
      leaderboard,
      complete: vi.fn(),
    })

    render(
      <VocabMatch
        deck={deck}
        filters={{ onlyDue: false, onlyStarred: false }}
      />
    )

    expect(screen.getByText('Match player')).toBeInTheDocument()
    expect(screen.queryByText('Leaderboard')).not.toBeInTheDocument()
  })

  it('should_show_leaderboard_after_game_completion', () => {
    useMatchSession.mockReturnValue({
      status: 'complete',
      session: { id: 'session-1', cards: [] },
      completion: { durationMs: 1000 },
      leaderboard,
      restart: vi.fn(),
    })

    render(
      <VocabMatch
        deck={deck}
        filters={{ onlyDue: false, onlyStarred: false }}
      />
    )

    expect(screen.getByText('Match summary')).toBeInTheDocument()
    expect(screen.getByText('Leaderboard')).toBeInTheDocument()
  })
})
