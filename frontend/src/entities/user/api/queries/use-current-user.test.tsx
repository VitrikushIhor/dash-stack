import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/api'
import { userApi } from '../user-api'
import { userKeys } from '../user-query-keys'
import { useCurrentUser, useCurrentUserState } from './use-current-user'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useCurrentUser', () => {
  afterEach(() => vi.restoreAllMocks())

  it('should_resolve_an_unauthorized_response_as_a_guest', async () => {
    const getMe = vi
      .spyOn(userApi, 'getMe')
      .mockRejectedValue(new ApiError(401, 'Unauthorized'))

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => expect(result.current.data).toBeNull())
    expect(result.current.isError).toBe(false)
    expect(getMe).toHaveBeenCalledOnce()
  })

  it('should_keep_non_authentication_failures_as_query_errors', async () => {
    const getMe = vi
      .spyOn(userApi, 'getMe')
      .mockRejectedValue(new ApiError(503, 'Service unavailable'))

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 3000,
    })
    expect(result.current.data).toBeUndefined()
    expect(getMe).toHaveBeenCalledTimes(2)
  })

  it('should_not_retry_a_forbidden_identity_response', async () => {
    const getMe = vi
      .spyOn(userApi, 'getMe')
      .mockRejectedValue(new ApiError(403, 'Forbidden'))

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(getMe).toHaveBeenCalledOnce()
  })

  it('should_recover_after_one_network_retry', async () => {
    const user = { id: 'user-1', firstName: 'Ada', email: 'ada@example.test' }
    const getMe = vi
      .spyOn(userApi, 'getMe')
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(user)

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual(user), {
      timeout: 3000,
    })
    expect(getMe).toHaveBeenCalledTimes(2)
  })

  it('should_expose_guest_state_after_unauthorized_identity_response', async () => {
    vi.spyOn(userApi, 'getMe').mockRejectedValue(
      new ApiError(401, 'Unauthorized')
    )

    const { result } = renderHook(() => useCurrentUserState(), { wrapper })

    await waitFor(() =>
      expect(result.current.authState).toEqual({ status: 'guest' })
    )
  })

  it('should_expose_authenticated_identity_after_loading', async () => {
    const user = { id: 'user-1', firstName: 'Ada', email: 'ada@example.test' }
    vi.spyOn(userApi, 'getMe').mockResolvedValue(user)

    const { result } = renderHook(() => useCurrentUserState(), { wrapper })

    expect(result.current.authState).toEqual({ status: 'loading' })
    await waitFor(() =>
      expect(result.current.authState).toEqual({
        status: 'authenticated',
        user,
      })
    )
  })

  it('should_preserve_cached_identity_when_background_refetch_fails', async () => {
    const user = { id: 'user-1', firstName: 'Ada', email: 'ada@example.test' }
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    client.setQueryData(userKeys.me(), user)
    vi.spyOn(userApi, 'getMe').mockRejectedValue(
      new ApiError(503, 'Service unavailable')
    )
    const cachedUserWrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(
      () => ({ ...useCurrentUserState(), query: useCurrentUser() }),
      {
        wrapper: cachedUserWrapper,
      }
    )

    expect(result.current.authState).toEqual({
      status: 'authenticated',
      user,
    })
    await act(async () => {
      const refreshed = await result.current.refetch()
      expect(refreshed.isError).toBe(true)
    })
    await waitFor(() => expect(result.current.query.isError).toBe(true))
    await waitFor(() =>
      expect(result.current.authState).toEqual({
        status: 'authenticated',
        user,
      })
    )
  })

  it('should_replace_cached_identity_with_guest_when_refetch_returns_401', async () => {
    const user = { id: 'user-1', firstName: 'Ada', email: 'ada@example.test' }
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    client.setQueryData(userKeys.me(), user)
    vi.spyOn(userApi, 'getMe').mockRejectedValue(
      new ApiError(401, 'Unauthorized')
    )
    const cachedUserWrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(
      () => ({ ...useCurrentUserState(), query: useCurrentUser() }),
      {
        wrapper: cachedUserWrapper,
      }
    )

    expect(result.current.authState).toEqual({
      status: 'authenticated',
      user,
    })
    await act(async () => {
      const refreshed = await result.current.refetch()
      expect(refreshed.data).toBeNull()
    })
    await waitFor(() => expect(result.current.query.data).toBeNull())
    await waitFor(() =>
      expect(result.current.authState).toEqual({
        status: 'guest',
      })
    )
  })

  it('should_expose_non_authentication_failure_for_retry', async () => {
    vi.spyOn(userApi, 'getMe').mockRejectedValue(
      new ApiError(503, 'Service unavailable')
    )

    const { result } = renderHook(() => useCurrentUserState(), { wrapper })

    await waitFor(
      () =>
        expect(result.current.authState).toEqual({
          status: 'error',
          message: 'Service unavailable',
        }),
      { timeout: 3000 }
    )
  })
})
