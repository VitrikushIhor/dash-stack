import { type ReactNode, createElement } from 'react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/config'
import { userKeys } from '@/entities/user'
import { vocabKeys } from '@/entities/vocab'
import { logoutAction } from '../../api/actions/logout.action'
import { useLogout } from './use-logout-hook'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))
vi.mock('sonner', () => ({
  toast: { success: vi.fn() },
}))
vi.mock('../../api/actions/logout.action', () => ({
  logoutAction: vi.fn(),
}))

describe('useLogout', () => {
  const push = vi.fn()
  let queryClient: QueryClient

  function withQueryClient({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.mocked(useRouter).mockReturnValue({
      push,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    })
  })

  it('should_logout_with_server_action_and_navigate_to_sign_in', async () => {
    queryClient.setQueryData(userKeys.me(), { id: 'user-a' })
    queryClient.setQueryData(vocabKeys.deckCards('deck-a', ''), [
      { id: 'private-card-a' },
    ])
    const clear = vi.spyOn(queryClient, 'clear')
    vi.mocked(logoutAction).mockResolvedValue({
      success: true,
      data: { message: 'Logged out successfully' },
    })

    const { result } = renderHook(() => useLogout(), {
      wrapper: withQueryClient,
    })

    act(() => result.current.handleLogout())

    expect(result.current.isPending).toBe(true)

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(logoutAction).toHaveBeenCalledOnce()
    expect(clear).toHaveBeenCalledOnce()
    expect(queryClient.getQueryData(userKeys.me())).toBeUndefined()
    expect(
      queryClient.getQueryData(vocabKeys.deckCards('deck-a', ''))
    ).toBeUndefined()
    expect(toast.success).toHaveBeenCalledWith('Logged out successfully')
    expect(push).toHaveBeenCalledWith(ROUTES.signIn)
  })

  it('should_discard_a_late_private_query_response_after_logout', async () => {
    let resolvePrivateCards: (cards: Array<{ id: string }>) => void = () =>
      undefined
    const privateCardsRequest = queryClient
      .fetchQuery({
        queryKey: vocabKeys.deckCards('deck-a', ''),
        queryFn: () =>
          new Promise<Array<{ id: string }>>((resolve) => {
            resolvePrivateCards = resolve
          }),
      })
      .catch(() => undefined)
    vi.mocked(logoutAction).mockResolvedValue({
      success: true,
      data: { message: 'Logged out successfully' },
    })

    const { result } = renderHook(() => useLogout(), {
      wrapper: withQueryClient,
    })

    act(() => result.current.handleLogout())

    await waitFor(() => expect(result.current.isPending).toBe(false))
    resolvePrivateCards([{ id: 'private-card-a' }])
    await privateCardsRequest

    expect(
      queryClient.getQueryData(vocabKeys.deckCards('deck-a', ''))
    ).toBeUndefined()
  })
})
