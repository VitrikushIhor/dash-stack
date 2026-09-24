import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/api'
import { userApi } from '../user-api'
import { useCurrentUser } from './use-current-user'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useCurrentUser', () => {
  it('should_resolve_an_unauthorized_response_as_a_guest', async () => {
    vi.spyOn(userApi, 'getMe').mockRejectedValue(
      new ApiError(401, 'Unauthorized')
    )

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => expect(result.current.data).toBeNull())
    expect(result.current.isError).toBe(false)
  })

  it('should_keep_non_authentication_failures_as_query_errors', async () => {
    vi.spyOn(userApi, 'getMe').mockRejectedValue(
      new ApiError(503, 'Service unavailable')
    )

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
