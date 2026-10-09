import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { vocabApi } from '../api/vocab-api'
import { useMatchLeaderboard } from './use-match-leaderboard'

function renderLeaderboard(enabled: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return renderHook(() => useMatchLeaderboard('deck-1', { enabled }), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

describe('useMatchLeaderboard', () => {
  it('does not load the leaderboard while a Match session is playing', () => {
    const getLeaderboard = vi.spyOn(vocabApi, 'getLeaderboard')

    renderLeaderboard(false)

    expect(getLeaderboard).not.toHaveBeenCalled()
  })

  it('loads the leaderboard when enabled', async () => {
    const getLeaderboard = vi
      .spyOn(vocabApi, 'getLeaderboard')
      .mockResolvedValue({
        data: [],
        currentUserBest: null,
        meta: {
          total: 0,
          lastPage: 1,
          currentPage: 1,
          perPage: 10,
          prev: null,
          next: null,
        },
      })

    renderLeaderboard(true)

    await waitFor(() => expect(getLeaderboard).toHaveBeenCalledWith('deck-1'))
  })
})
