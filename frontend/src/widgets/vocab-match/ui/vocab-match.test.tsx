import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Deck } from '@/entities/deck'
import { VocabMatch } from './vocab-match'

const useMatchSession = vi.fn()

vi.mock('next/dynamic', () => ({
  default: () => () => <div>Match player</div>,
}))

vi.mock('@/features/study-vocab', () => ({
  MAX_MATCH_CARDS: 12,
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
  StudySavingState: () => <div>Saving</div>,
  StudySummary: () => <div>Match summary</div>,
  useMatchSession: (...args: unknown[]) => useMatchSession(...args),
}))

vi.mock('@/shared/ui/feedback', () => ({
  WidgetErrorState: ({
    title,
    description,
    onRetry,
  }: {
    title: string
    description: string
    onRetry: () => void
  }) => (
    <div role='alert'>
      <h2>{title}</h2>
      <p>{description}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}))

const deck = {
  id: 'deck-1',
  title: 'Match deck',
} as Deck
const initialCards = Array.from({ length: 6 }, (_, index) => ({
  id: `card-${index}`,
  deckId: 'deck-1',
  term: `Term ${index}`,
  definition: `Definition ${index}`,
  example: null,
  imageUrl: null,
  position: index,
  progress: {
    id: null,
    status: 'NEW' as const,
    box: 1,
    isStarred: false,
    correctStreak: 0,
    correctCount: 0,
    incorrectCount: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
  },
}))

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
        initialCards={initialCards}
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
        initialCards={initialCards}
      />
    )

    expect(screen.getByText('Match summary')).toBeInTheDocument()
    expect(screen.getByText('Leaderboard')).toBeInTheDocument()
  })

  it('should_render_the_local_match_player_for_a_guest', () => {
    useMatchSession.mockReturnValue({
      status: 'guest',
      session: null,
      completion: null,
      leaderboard,
    })

    render(
      <VocabMatch
        deck={deck}
        filters={{ onlyDue: false, onlyStarred: false }}
        initialCards={initialCards}
      />
    )

    expect(screen.getByText('Match player')).toBeInTheDocument()
    expect(screen.getByText('Leaderboard')).toBeInTheDocument()
  })

  it('should_show_identity_failure_and_allow_retry', async () => {
    const retry = vi.fn()
    useMatchSession.mockReturnValue({
      status: 'error',
      session: null,
      completion: null,
      error: 'Identity service unavailable',
      leaderboard,
      retry,
    })

    render(
      <VocabMatch
        deck={deck}
        filters={{ onlyDue: false, onlyStarred: false }}
        initialCards={initialCards}
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Identity service unavailable'
    )
    expect(screen.queryByText('Loading')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(retry).toHaveBeenCalledOnce()
  })
})
