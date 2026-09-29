import { type ReactNode, createElement } from 'react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { handleServerError } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import {
  AUTH_SESSION_EVENT_KEY,
  AUTH_SESSION_EVENT_KIND,
  parseAuthSessionEvent,
} from '@/shared/lib/auth-session-events'
import { userKeys } from '@/entities/user'
import { vocabKeys } from '@/entities/vocab'
import { logoutAction } from '../../api/actions/logout.action'
import { useLogout } from './use-logout-hook'

vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/api')>()),
  handleServerError: vi.fn(),
}))

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
    window.localStorage.clear()
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

  afterEach(() => vi.restoreAllMocks())

  it.each([false, true])(
    'should_logout_with_server_action_and_navigate_to_sign_in with blocked storage %s',
    async (blockedStorage) => {
      if (blockedStorage)
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
          throw new DOMException('Blocked', 'SecurityError')
        })
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
    }
  )

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
  it('should_clear_private_cache_and_broadcast_local_logout_when_server_revoke_fails', async () => {
    queryClient.setQueryData(userKeys.me(), { id: 'user-a' })
    vi.mocked(logoutAction).mockResolvedValue({
      success: false,
      error: 'Backend unavailable',
    })
    const { result } = renderHook(() => useLogout(), {
      wrapper: withQueryClient,
    })
    act(() => result.current.handleLogout())
    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(queryClient.getQueryData(userKeys.me())).toBeUndefined()
    expect(
      parseAuthSessionEvent(window.localStorage.getItem(AUTH_SESSION_EVENT_KEY))
        ?.kind
    ).toBe(AUTH_SESSION_EVENT_KIND.SIGNED_OUT)
    expect(push).toHaveBeenCalledWith(ROUTES.signIn)
    expect(handleServerError).toHaveBeenCalledWith(
      'Signed out on this device. Server logout could not be confirmed: Backend unavailable'
    )
    expect(toast.success).not.toHaveBeenCalled()
  })
})
