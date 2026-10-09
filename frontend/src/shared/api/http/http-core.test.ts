import { afterEach, describe, expect, it, vi } from 'vitest'
import { createHttpClient } from './http-core'

describe('createHttpClient unauthorized handling', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not invoke the global unauthorized handler for an optional identity request', async () => {
    const onUnauthorized = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            statusCode: 401,
            message: 'Unauthorized',
            error: 'Unauthorized',
          }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        )
      )
    )
    const client = createHttpClient({
      baseURL: 'http://example.test',
      getHeaders: () => ({}),
      onUnauthorized,
    })

    await expect(
      client.get('/me', { suppressUnauthorizedHandler: true })
    ).rejects.toMatchObject({ statusCode: 401 })
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('preserves the global unauthorized handler for protected requests', async () => {
    const onUnauthorized = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            statusCode: 401,
            message: 'Unauthorized',
            error: 'Unauthorized',
          }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        )
      )
    )
    const client = createHttpClient({
      baseURL: 'http://example.test',
      getHeaders: () => ({}),
      onUnauthorized,
    })

    await expect(client.get('/protected')).rejects.toMatchObject({
      statusCode: 401,
    })
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })
})
