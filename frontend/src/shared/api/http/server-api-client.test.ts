import { cookies } from 'next/headers'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createServerApiClient } from './server-api-client'

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ cookies: vi.fn() }))
vi.mock('@/shared/config/env', () => ({
  env: { API_URL: 'http://backend.test' },
}))

describe('createServerApiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('should_propagate_unauthorized_response_to_the_server_caller', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ value: 'access-token' }),
    } as Awaited<ReturnType<typeof cookies>>)
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(createServerApiClient().get('/me')).rejects.toMatchObject({
      statusCode: 401,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://backend.test/api/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }),
      })
    )
  })
})
