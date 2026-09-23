import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/api'
import { type User, userApi, userKeys } from '@/entities/user'
import { type MatchLeaderboard, vocabApi } from '@/entities/vocab'
import {
  completeMatchSessionAction,
  createMatchSessionAction,
  recordMatchPairAction,
} from '../../server'
import { useMatchSession } from './session/use-match-session'

vi.mock('../../server', () => ({
  createMatchSessionAction: vi.fn(),
  completeMatchSessionAction: vi.fn(),
  recordMatchPairAction: vi.fn(),
}))

const user: User = {
  id: 'user-1',
  firstName: 'Learner',
  email: 'learner@example.test',
}
const session = {
  id: 'session-1',
  deckId: 'deck-1',
  startedAt: '2026-09-09T10:00:00.000Z',
  expiresAt: '2026-09-09T10:30:00.000Z',
  cards: Array.from({ length: 6 }, (_, index) => ({
    id: `card-${index}`,
    deckId: 'deck-1',
    term: `Term ${index}`,
    definition: `Definition ${index}`,
  })),
}
const entry = {
  id: 'best-1',
  deckId: 'deck-1',
  userId: user.id,
  durationMs: 14500,
  cardCount: 6,
  createdAt: '2026-09-09T10:00:14.500Z',
  user: {
    id: user.id,
    firstName: user.firstName,
    lastName: null,
    avatar: null,
  },
}
const board: MatchLeaderboard = {
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
}

function renderSession(
  currentUser: User | null | undefined = user,
  seedCurrentUser = true
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  if (seedCurrentUser) client.setQueryData(userKeys.me(), currentUser)

  return renderHook(
    ({ deckId }) =>
      useMatchSession(deckId, { onlyDue: true, onlyStarred: false }),
    {
      initialProps: { deckId: 'deck-1' },
      reactStrictMode: true,
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    }
  )
}

describe('useMatchSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(vocabApi, 'getLeaderboard').mockResolvedValue(board)
    vi.mocked(createMatchSessionAction).mockResolvedValue({
      success: true,
      data: session,
    })
    vi.mocked(completeMatchSessionAction).mockResolvedValue({
      success: true,
      data: {
        sessionId: session.id,
        durationMs: 14500,
        cardCount: 6,
        completedAt: '2026-09-09T10:00:14.500Z',
        bestResult: entry,
      },
    })
    vi.mocked(recordMatchPairAction).mockResolvedValue({
      success: true,
      data: { attemptId: '00000000-0000-4000-8000-000000000001' },
    })
  })

  it('should_create_server_session_before_exposing_cards_to_the_reducer', async () => {
    const { result } = renderSession()

    expect(result.current.session).toBeNull()
    await waitFor(() => expect(result.current.status).toBe('playing'))
    expect(createMatchSessionAction).toHaveBeenCalledWith({
      deckId: 'deck-1',
      onlyDue: true,
      onlyStarred: false,
    })
    expect(createMatchSessionAction).toHaveBeenCalledTimes(1)
    expect(result.current.session?.cards).toEqual(session.cards)
  })

  it('should_complete_each_server_session_exactly_once', async () => {
    const { result } = renderSession()

    await waitFor(() => expect(result.current.status).toBe('playing'))
    await act(async () => {
      await Promise.all([result.current.complete(), result.current.complete()])
    })
    expect(completeMatchSessionAction).toHaveBeenCalledTimes(1)
    expect(completeMatchSessionAction).toHaveBeenCalledWith({
      deckId: 'deck-1',
      sessionId: 'session-1',
    })
    expect(result.current.completion?.durationMs).toBe(14500)
  })

  it('should_expose_failure_and_retry_completion_without_creating_another_session', async () => {
    vi.mocked(completeMatchSessionAction)
      .mockResolvedValueOnce({ success: false, error: 'Temporary failure' })
      .mockResolvedValueOnce({
        success: true,
        data: {
          sessionId: session.id,
          durationMs: 14500,
          cardCount: 6,
          completedAt: entry.createdAt,
          bestResult: entry,
        },
      })
    const { result } = renderSession()

    await waitFor(() => expect(result.current.status).toBe('playing'))
    await act(async () => {
      await result.current.complete()
    })
    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Temporary failure')
    await act(async () => {
      result.current.retry()
    })
    await waitFor(() => expect(result.current.status).toBe('complete'))
    expect(createMatchSessionAction).toHaveBeenCalledTimes(1)
    expect(completeMatchSessionAction).toHaveBeenCalledTimes(2)
  })

  it('should_ignore_previous_deck_response_when_session_scope_changes', async () => {
    let resolvePrevious:
      | ((value: Awaited<ReturnType<typeof createMatchSessionAction>>) => void)
      | undefined
    vi.mocked(createMatchSessionAction)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePrevious = resolve
          })
      )
      .mockResolvedValue({
        success: true,
        data: { ...session, id: 'session-2', deckId: 'deck-2' },
      })
    const view = renderSession()

    await waitFor(() =>
      expect(createMatchSessionAction).toHaveBeenCalledTimes(1)
    )
    view.rerender({ deckId: 'deck-2' })
    await waitFor(() =>
      expect(view.result.current.session?.id).toBe('session-2')
    )
    await act(async () => {
      resolvePrevious?.({ success: true, data: session })
    })

    expect(view.result.current.session?.id).toBe('session-2')
  })

  it('should_not_create_a_session_for_a_confirmed_guest', async () => {
    const { result } = renderSession(null)

    await waitFor(() => expect(result.current.status).toBe('guest'))
    expect(createMatchSessionAction).not.toHaveBeenCalled()
  })

  it('should_expose_identity_failure_and_retry_until_guest_is_resolved', async () => {
    vi.spyOn(userApi, 'getMe')
      .mockRejectedValueOnce(new ApiError(500, 'Identity service unavailable'))
      .mockRejectedValueOnce(new ApiError(401, 'Unauthorized'))
    const { result } = renderSession(undefined, false)

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toBe('Identity service unavailable')
    expect(createMatchSessionAction).not.toHaveBeenCalled()

    act(() => result.current.retry())

    await waitFor(() => expect(result.current.status).toBe('guest'))
    expect(userApi.getMe).toHaveBeenCalledTimes(2)
    expect(createMatchSessionAction).not.toHaveBeenCalled()
  })
})
