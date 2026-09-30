import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { COOKIE_CONFIG } from '@/shared/lib/session-cookies'
import { GET, POST } from './route'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

describe('Proxy API Route (/api/proxy/[...path])', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function setupCookieMock(cookiesRecord: Record<string, string> = {}) {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn((name: string) =>
        cookiesRecord[name] ? { value: cookiesRecord[name] } : undefined
      ),
      set: vi.fn(),
      delete: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof cookies>>)
  }

  function refreshResponse(
    accessToken: string,
    refreshToken: string
  ): Response {
    const response = Response.json({ authenticated: true })
    response.headers.append(
      'set-cookie',
      `${COOKIE_CONFIG.ACCESS_TOKEN.name}=${accessToken}; Path=/; HttpOnly`
    )
    response.headers.append(
      'set-cookie',
      `${COOKIE_CONFIG.REFRESH_TOKEN.name}=${refreshToken}; Path=/; HttpOnly`
    )
    return response
  }

  // ---------------------------------------------------------------------------
  // Basic forwarding
  // ---------------------------------------------------------------------------

  it('forwards GET request with Bearer authorization header when access_token exists', async () => {
    setupCookieMock({ access_token: 'existing-access-token' })
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const req = new NextRequest('http://localhost:3000/api/proxy/tasks')
    const params = Promise.resolve({ path: ['tasks'] })

    const res = await GET(req, { params })
    const body = await res.json()

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8000/api/tasks',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer existing-access-token',
        }),
      })
    )
    expect(res.status).toBe(200)
    expect(body).toEqual({ success: true })
  })

  it('forwards POST request with binary buffer without corrupting data', async () => {
    setupCookieMock({ access_token: 'test-token' })
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ key: 'img.webp', url: 'http://localhost/img.webp' }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    )

    const binaryData = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ])
    const req = new NextRequest(
      'http://localhost:3000/api/proxy/storage/image',
      {
        method: 'POST',
        headers: { 'Content-Type': 'image/png' },
        body: binaryData,
      }
    )
    const params = Promise.resolve({ path: ['storage', 'image'] })

    const res = await POST(req, { params })
    const body = await res.json()

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8000/api/storage/image',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'image/png',
          Authorization: 'Bearer test-token',
        }),
        body: expect.any(ArrayBuffer),
      })
    )
    expect(res.status).toBe(201)
    expect(body).toEqual({ key: 'img.webp', url: 'http://localhost/img.webp' })
  })

  it('rejects an oversized chunked JSON body before forwarding upstream', async () => {
    setupCookieMock({ access_token: 'test-token' })
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    let chunksRead = 0
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        chunksRead += 1
        controller.enqueue(new Uint8Array(2 * 1024 * 1024))
        if (chunksRead === 3) controller.close()
      },
    })
    const req = new NextRequest('http://localhost:3000/api/proxy/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      duplex: 'half',
    })

    const res = await POST(req, {
      params: Promise.resolve({ path: ['tasks'] }),
    })

    expect(res.status).toBe(413)
    expect(chunksRead).toBeLessThanOrEqual(4)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('rejects an oversized declared body without reading or forwarding it', async () => {
    setupCookieMock({ access_token: 'test-token' })
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const req = new NextRequest('http://localhost:3000/api/proxy/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': String(6 * 1024 * 1024),
      },
      body: '{}',
    })

    const res = await POST(req, {
      params: Promise.resolve({ path: ['tasks'] }),
    })

    expect(res.status).toBe(413)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it.each(['abc', '-10', 'Infinity', '1.5', '', '+10'])(
    'rejects malformed Content-Length %j before forwarding upstream',
    async (declaredLength) => {
      setupCookieMock({ access_token: 'test-token' })
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      const req = new NextRequest('http://localhost:3000/api/proxy/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': declaredLength,
        },
        body: '{}',
      })

      const res = await POST(req, {
        params: Promise.resolve({ path: ['tasks'] }),
      })

      expect(res.status).toBe(413)
      expect(fetchSpy).not.toHaveBeenCalled()
    }
  )

  it('applies the form body limit to mixed-case media types', async () => {
    setupCookieMock({ access_token: 'test-token' })
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const req = new NextRequest('http://localhost:3000/api/proxy/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/X-Www-Form-Urlencoded',
        'Content-Length': String(2 * 1024 * 1024),
      },
      body: 'x',
    })

    const res = await POST(req, {
      params: Promise.resolve({ path: ['tasks'] }),
    })

    expect(res.status).toBe(413)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('keeps image upload requests within the upload-specific body limit', async () => {
    setupCookieMock({ access_token: 'test-token' })
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('{}', { status: 201 }))
    const req = new NextRequest(
      'http://localhost:3000/api/proxy/storage/image',
      {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data; boundary=test' },
        body: new Uint8Array(6 * 1024 * 1024),
      }
    )

    const res = await POST(req, {
      params: Promise.resolve({ path: ['storage', 'image'] }),
    })

    expect(res.status).toBe(201)
    expect(fetchSpy).toHaveBeenCalledOnce()
  })

  it.each([
    ['storage/file/extra', ['storage', 'file', 'extra']],
    ['storage/image/extra', ['storage', 'image', 'extra']],
  ])(
    'rejects oversized bodies on non-upload path %s',
    async (routePath, path) => {
      setupCookieMock({ access_token: 'test-token' })
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      const req = new NextRequest(
        `http://localhost:3000/api/proxy/${routePath}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'multipart/form-data; boundary=test' },
          body: new Uint8Array(6 * 1024 * 1024),
        }
      )

      const response = await POST(req, { params: Promise.resolve({ path }) })

      expect(response.status).toBe(413)
      expect(fetchSpy).not.toHaveBeenCalled()
    }
  )

  it('rejects oversized non-multipart data on an upload path', async () => {
    setupCookieMock({ access_token: 'test-token' })
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const req = new NextRequest(
      'http://localhost:3000/api/proxy/storage/file',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: new Uint8Array(6 * 1024 * 1024),
      }
    )

    const response = await POST(req, {
      params: Promise.resolve({ path: ['storage', 'file'] }),
    })

    expect(response.status).toBe(413)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('forwards Content-Disposition for download responses', async () => {
    setupCookieMock({ access_token: 'token' })
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('export body', {
        status: 200,
        headers: {
          'Content-Disposition': 'attachment; filename="vocabulary-deck.json"',
          'Content-Type': 'application/json; charset=utf-8',
        },
      })
    )

    const req = new NextRequest(
      'http://localhost:3000/api/proxy/v1/vocab/decks/deck-id/export?format=json'
    )
    const params = Promise.resolve({
      path: ['v1', 'vocab', 'decks', 'deck-id', 'export'],
    })

    const res = await GET(req, { params })

    expect(res.headers.get('Content-Disposition')).toBe(
      'attachment; filename="vocabulary-deck.json"'
    )
  })

  it('sets Cache-Control: no-store on all responses', async () => {
    setupCookieMock({ access_token: 'token' })
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )

    const req = new NextRequest('http://localhost:3000/api/proxy/me')
    const params = Promise.resolve({ path: ['me'] })

    const res = await GET(req, { params })

    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it.each([
    ['http://sibling.localhost:3000', 'same-site'],
    ['null', 'cross-site'],
    [undefined, 'cross-site'],
  ])(
    'rejects unsafe proxy mutation from origin %s and site %s',
    async (origin, site) => {
      setupCookieMock({ access_token: 'token' })
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      const req = new NextRequest('http://localhost:3000/api/proxy/tasks', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(origin ? { origin } : {}),
          'sec-fetch-site': site,
        },
        body: JSON.stringify({ title: 'Injected' }),
      })

      const res = await POST(req, {
        params: Promise.resolve({ path: ['tasks'] }),
      })

      expect(res.status).toBe(403)
      expect(fetchSpy).not.toHaveBeenCalled()
    }
  )

  it('rejects a cross-scheme mutation on the same host', async () => {
    setupCookieMock({ access_token: 'token' })
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const req = new NextRequest('https://example.test/api/proxy/tasks', {
      method: 'POST',
      headers: {
        host: 'example.test',
        origin: 'http://example.test',
      },
      body: '{}',
    })

    const res = await POST(req, {
      params: Promise.resolve({ path: ['tasks'] }),
    })

    expect(res.status).toBe(403)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('rejects a mutation whose Origin only matches a spoofed Host header', async () => {
    setupCookieMock({ access_token: 'token' })
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const req = new NextRequest('http://localhost:3000/api/proxy/tasks', {
      method: 'POST',
      headers: {
        host: 'evil.example',
        origin: 'http://evil.example',
        'sec-fetch-site': 'same-origin',
      },
      body: '{}',
    })

    const res = await POST(req, {
      params: Promise.resolve({ path: ['tasks'] }),
    })

    expect(res.status).toBe(403)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('accepts a same-origin proxy mutation', async () => {
    setupCookieMock({ access_token: 'token' })
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('{}', { status: 201 })
    )
    const req = new NextRequest('http://localhost:3000/api/proxy/tasks', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'http://localhost:3000',
        'sec-fetch-site': 'same-origin',
      },
      body: JSON.stringify({ title: 'Allowed' }),
    })

    const res = await POST(req, {
      params: Promise.resolve({ path: ['tasks'] }),
    })

    expect(res.status).toBe(201)
  })

  it('accepts same-origin browser mutation when Next internal URL uses another hostname', async () => {
    setupCookieMock({ access_token: 'token' })
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('{}', { status: 201 })
    )
    const req = new NextRequest(
      'http://localhost:3000/api/proxy/storage/file',
      {
        method: 'POST',
        headers: {
          host: '127.0.0.1:3000',
          origin: 'http://127.0.0.1:3000',
          'sec-fetch-site': 'same-origin',
        },
        body: 'file',
      }
    )

    const res = await POST(req, {
      params: Promise.resolve({ path: ['storage', 'file'] }),
    })

    expect(res.status).toBe(201)
  })

  it('rejects a cookie mutation when browser origin headers are missing', async () => {
    setupCookieMock({ access_token: 'token' })
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const req = new NextRequest('http://localhost:3000/api/proxy/tasks', {
      method: 'POST',
      headers: { cookie: 'access_token=token' },
      body: '{}',
    })

    const res = await POST(req, {
      params: Promise.resolve({ path: ['tasks'] }),
    })

    expect(res.status).toBe(403)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  // ---------------------------------------------------------------------------
  // Path validation
  // ---------------------------------------------------------------------------

  it('rejects path traversal attempts with 400', async () => {
    setupCookieMock({ access_token: 'token' })
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    const req = new NextRequest(
      'http://localhost:3000/api/proxy/../../etc/passwd'
    )
    const params = Promise.resolve({ path: ['..', '..', 'etc', 'passwd'] })

    const res = await GET(req, { params })
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('INVALID_PATH')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it.each([
    '%2e%2e',
    '%252e%252e',
    '%2f%2fevil.test',
    '%5c',
    'nested/path',
    'query?admin=true',
    'fragment#other',
  ])(
    'rejects structural proxy path segment %s before fetch',
    async (segment) => {
      setupCookieMock({ access_token: 'token' })
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      const req = new NextRequest('http://localhost:3000/api/proxy/tasks')

      const res = await GET(req, {
        params: Promise.resolve({ path: ['tasks', segment] }),
      })

      expect(res.status).toBe(400)
      expect(fetchSpy).not.toHaveBeenCalled()
    }
  )

  it('keeps the configured upstream host when query and forwarded headers contain another URL', async () => {
    setupCookieMock({ access_token: 'token' })
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
    const req = new NextRequest(
      'http://localhost:3000/api/proxy/health?next=https%3A%2F%2Fevil.example%2Fsecret',
      {
        headers: {
          host: 'localhost:3000',
          'x-forwarded-host': 'evil.example',
          'x-forwarded-proto': 'https',
          cookie: 'access_token=token',
        },
      }
    )

    const response = await GET(req, {
      params: Promise.resolve({ path: ['health'] }),
    })

    expect(response.status).toBe(200)
    const [url, options] = fetchSpy.mock.calls[0]
    expect(url).toBe(
      'http://localhost:8000/api/health?next=https%3A%2F%2Fevil.example%2Fsecret'
    )
    const headers = new Headers(options?.headers)
    expect(headers.get('x-forwarded-host')).toBeNull()
    expect(headers.get('x-forwarded-proto')).toBeNull()
    expect(headers.get('cookie')).toBeNull()
    expect(headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/)
    expect(response.headers.get('x-request-id')).toBe(
      headers.get('x-request-id')
    )
  })

  it('encodes a legitimate dynamic segment without changing the upstream path', async () => {
    setupCookieMock({ access_token: 'token' })
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
    const req = new NextRequest(
      'http://localhost:3000/api/proxy/decks/deck%20id'
    )

    const res = await GET(req, {
      params: Promise.resolve({ path: ['decks', 'deck id'] }),
    })

    expect(res.status).toBe(200)
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8000/api/decks/deck%20id',
      expect.any(Object)
    )
  })

  it('does not follow upstream redirects to another origin', async () => {
    setupCookieMock({ access_token: 'token' })
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        Response.redirect('https://other.example/private', 302)
      )
    const req = new NextRequest('http://localhost:3000/api/proxy/tasks')

    const res = await GET(req, {
      params: Promise.resolve({ path: ['tasks'] }),
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8000/api/tasks',
      expect.objectContaining({ redirect: 'manual' })
    )
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({
      code: 'UPSTREAM_REDIRECT',
      message: 'Unexpected upstream redirect',
    })
    expect(res.headers.get('location')).toBeNull()
  })

  // ---------------------------------------------------------------------------
  // Network error handling
  // ---------------------------------------------------------------------------

  it('returns 502 when upstream backend is unavailable', async () => {
    setupCookieMock({ access_token: 'token' })
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
      new Error('connect ECONNREFUSED')
    )

    const req = new NextRequest('http://localhost:3000/api/proxy/tasks')
    const params = Promise.resolve({ path: ['tasks'] })

    const res = await GET(req, { params })
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.code).toBe('UPSTREAM_UNAVAILABLE')
  })

  // ---------------------------------------------------------------------------
  // Silent Refresh: 401 → refresh → retry
  // ---------------------------------------------------------------------------

  it('performs silent refresh, retries with new token, returns 200 with correct body', async () => {
    setupCookieMock({
      access_token: 'expired-access-token',
      refresh_token: 'valid-refresh-token',
    })

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )
      .mockResolvedValueOnce(
        refreshResponse('new-access-token-123', 'new-refresh-token-456')
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: 'secret-data' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

    const req = new NextRequest('http://localhost:3000/api/proxy/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'New Task' }),
    })
    const params = Promise.resolve({ path: ['tasks'] })

    const res = await POST(req, { params })
    const body = await res.json()

    // Verify refresh endpoint was called correctly
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      'http://localhost:8000/api/auth/refresh',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'valid-refresh-token' }),
      })
    )

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      'http://localhost:8000/api/tasks',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer expired-access-token',
        }),
      })
    )

    // Verify retry used the new access token
    expect(fetchSpy).toHaveBeenNthCalledWith(
      3,
      'http://localhost:8000/api/tasks',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer new-access-token-123',
        }),
      })
    )

    // Verify response status and body after successful retry
    expect(res.status).toBe(200)
    expect(body).toEqual({ data: 'secret-data' })
  })

  it('sets rotated cookies with correct security options on response after silent refresh', async () => {
    setupCookieMock({
      access_token: 'expired',
      refresh_token: 'valid-refresh',
    })

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(refreshResponse('fresh-access', 'fresh-refresh'))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      )

    const req = new NextRequest('http://localhost:3000/api/proxy/me')
    const params = Promise.resolve({ path: ['me'] })

    const res = await GET(req, { params })

    expect(res.status).toBe(200)

    // Verify access_token cookie on the response
    const accessCookie = res.cookies.get(COOKIE_CONFIG.ACCESS_TOKEN.name)

    expect(accessCookie).toBeDefined()
    expect(accessCookie?.value).toBe('fresh-access')

    // Verify refresh_token cookie on the response
    const refreshCookie = res.cookies.get(COOKIE_CONFIG.REFRESH_TOKEN.name)

    expect(refreshCookie).toBeDefined()
    expect(refreshCookie?.value).toBe('fresh-refresh')

    // Verify security options via Set-Cookie headers
    const setCookieHeaders = res.headers.getSetCookie()
    const accessSetCookie = setCookieHeaders.find((h) =>
      h.startsWith('access_token=')
    )
    const refreshSetCookie = setCookieHeaders.find((h) =>
      h.startsWith('refresh_token=')
    )

    expect(accessSetCookie).toBeDefined()
    expect(accessSetCookie).toContain('HttpOnly')
    expect(accessSetCookie?.toLowerCase()).toContain('samesite=lax')
    expect(accessSetCookie).toContain('Path=/')
    expect(accessSetCookie).toContain(
      `Max-Age=${COOKIE_CONFIG.ACCESS_TOKEN.maxAge}`
    )

    expect(refreshSetCookie).toBeDefined()
    expect(refreshSetCookie).toContain('HttpOnly')
    expect(refreshSetCookie?.toLowerCase()).toContain('samesite=lax')
    expect(refreshSetCookie).toContain('Path=/')
    expect(refreshSetCookie).toContain(
      `Max-Age=${COOKIE_CONFIG.REFRESH_TOKEN.maxAge}`
    )
  })

  it('refreshes successfully when only refresh_token exists (no access_token)', async () => {
    setupCookieMock({
      refresh_token: 'valid-refresh-token',
    })

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )
      .mockResolvedValueOnce(
        refreshResponse('brand-new-access', 'brand-new-refresh')
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ user: 'data' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

    const req = new NextRequest('http://localhost:3000/api/proxy/me')
    const params = Promise.resolve({ path: ['me'] })

    const res = await GET(req, { params })
    const body = await res.json()

    // Should make 3 fetches: initial (401) → refresh → retry
    expect(fetchSpy).toHaveBeenCalledTimes(3)

    // Retry should use new token
    expect(fetchSpy).toHaveBeenNthCalledWith(
      3,
      'http://localhost:8000/api/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer brand-new-access',
        }),
      })
    )

    expect(res.status).toBe(200)
    expect(body).toEqual({ user: 'data' })

    // Verify new cookies are set on response
    expect(res.cookies.get('access_token')?.value).toBe('brand-new-access')
    expect(res.cookies.get('refresh_token')?.value).toBe('brand-new-refresh')
  })

  it('deduplicates concurrent refresh requests that use the same refresh token', async () => {
    setupCookieMock({
      access_token: 'expired-access-token',
      refresh_token: 'shared-refresh-token',
    })

    let refreshCalls = 0
    let protectedCalls = 0
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(
        async (
          input: RequestInfo | URL,
          init?: RequestInit
        ): Promise<Response> => {
          const url = input.toString()

          if (url.endsWith('/api/auth/refresh')) {
            refreshCalls += 1

            await Promise.resolve()

            return refreshResponse(
              'shared-new-access-token',
              'shared-new-refresh-token'
            )
          }

          protectedCalls += 1
          const authorization = new Headers(init?.headers).get('Authorization')

          if (authorization === 'Bearer shared-new-access-token') {
            return new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      )

    const params = Promise.resolve({ path: ['tasks'] })
    const [firstResponse, secondResponse] = await Promise.all([
      GET(new NextRequest('http://localhost:3000/api/proxy/tasks'), { params }),
      GET(new NextRequest('http://localhost:3000/api/proxy/tasks'), { params }),
    ])

    expect(firstResponse.status).toBe(200)
    expect(secondResponse.status).toBe(200)
    expect(refreshCalls).toBe(1)
    expect(protectedCalls).toBe(4)
    expect(fetchSpy).toHaveBeenCalledTimes(5)
    expect(firstResponse.cookies.get('refresh_token')?.value).toBe(
      'shared-new-refresh-token'
    )
    expect(secondResponse.cookies.get('refresh_token')?.value).toBe(
      'shared-new-refresh-token'
    )
  })

  // ---------------------------------------------------------------------------
  // Refresh response contract validation
  // ---------------------------------------------------------------------------

  it('returns 502 when refresh response is missing required tokens', async () => {
    setupCookieMock({
      access_token: 'expired',
      refresh_token: 'valid-refresh',
    })

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )
      .mockResolvedValueOnce(
        // Backend returns 200 but without required tokens
        new Response(JSON.stringify({ message: 'success' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

    const req = new NextRequest('http://localhost:3000/api/proxy/me')
    const params = Promise.resolve({ path: ['me'] })

    const res = await GET(req, { params })
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.code).toBe('INVALID_REFRESH_RESPONSE')

    const setCookieHeaders = res.headers.getSetCookie()
    const accessClear = setCookieHeaders.find((h) =>
      h.startsWith('access_token=')
    )
    const refreshClear = setCookieHeaders.find((h) =>
      h.startsWith('refresh_token=')
    )

    expect(accessClear).toBeDefined()
    expect(accessClear).toContain('Expires=Thu, 01 Jan 1970')
    expect(refreshClear).toBeDefined()
    expect(refreshClear).toContain('Expires=Thu, 01 Jan 1970')
  })

  it('returns 502 when refresh response has empty strings for tokens', async () => {
    setupCookieMock({
      access_token: 'expired',
      refresh_token: 'valid-refresh',
    })

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ accessToken: ' ', refreshToken: '' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

    const req = new NextRequest('http://localhost:3000/api/proxy/me')
    const params = Promise.resolve({ path: ['me'] })

    const res = await GET(req, { params })
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.code).toBe('INVALID_REFRESH_RESPONSE')

    const setCookieHeaders = res.headers.getSetCookie()
    const accessClear = setCookieHeaders.find((h) =>
      h.startsWith('access_token=')
    )
    const refreshClear = setCookieHeaders.find((h) =>
      h.startsWith('refresh_token=')
    )

    expect(accessClear).toBeDefined()
    expect(accessClear).toContain('Expires=Thu, 01 Jan 1970')
    expect(refreshClear).toBeDefined()
    expect(refreshClear).toContain('Expires=Thu, 01 Jan 1970')
  })

  it('returns 502 and clears cookies when refresh response is invalid JSON', async () => {
    setupCookieMock({
      access_token: 'expired',
      refresh_token: 'valid-refresh',
    })

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )
      .mockResolvedValueOnce(
        new Response('<html>Not JSON</html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        })
      )

    const req = new NextRequest('http://localhost:3000/api/proxy/me')
    const params = Promise.resolve({ path: ['me'] })

    const res = await GET(req, { params })
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.code).toBe('INVALID_REFRESH_RESPONSE')

    const setCookieHeaders = res.headers.getSetCookie()
    const accessClear = setCookieHeaders.find((h) =>
      h.startsWith('access_token=')
    )
    const refreshClear = setCookieHeaders.find((h) =>
      h.startsWith('refresh_token=')
    )

    expect(accessClear).toBeDefined()
    expect(accessClear).toContain('Expires=Thu, 01 Jan 1970')
    expect(refreshClear).toBeDefined()
    expect(refreshClear).toContain('Expires=Thu, 01 Jan 1970')
  })

  // ---------------------------------------------------------------------------
  // Failed refresh scenarios
  // ---------------------------------------------------------------------------

  it('clears auth cookies and returns 401 when refresh endpoint returns 401 (invalid session)', async () => {
    setupCookieMock({
      access_token: 'invalid-access-token',
      refresh_token: 'invalid-refresh-token',
    })

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Invalid refresh token' }), {
          status: 401,
        })
      )

    const req = new NextRequest('http://localhost:3000/api/proxy/user/me')
    const params = Promise.resolve({ path: ['user', 'me'] })

    const res = await GET(req, { params })

    // Should return the original 401
    expect(res.status).toBe(401)

    // Should NOT retry the original request (only 2 fetches: original + refresh)
    expect(fetchSpy).toHaveBeenCalledTimes(2)

    // Verify cookies are cleared via Set-Cookie on the response
    const setCookieHeaders = res.headers.getSetCookie()
    const accessClear = setCookieHeaders.find((h) =>
      h.startsWith('access_token=')
    )
    const refreshClear = setCookieHeaders.find((h) =>
      h.startsWith('refresh_token=')
    )

    expect(accessClear).toBeDefined()
    expect(accessClear).toContain('Expires=Thu, 01 Jan 1970')
    expect(accessClear).toContain('Path=/')
    expect(refreshClear).toBeDefined()
    expect(refreshClear).toContain('Expires=Thu, 01 Jan 1970')
    expect(refreshClear).toContain('Path=/')
  })

  it('preserves cookies and returns 503 when refresh endpoint returns 500 (transient error)', async () => {
    setupCookieMock({
      access_token: 'expired-token',
      refresh_token: 'valid-refresh',
    })

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Internal Server Error' }), {
          status: 500,
        })
      )

    const req = new NextRequest('http://localhost:3000/api/proxy/tasks')
    const params = Promise.resolve({ path: ['tasks'] })

    const res = await GET(req, { params })

    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body.code).toBe('SESSION_REFRESH_UNAVAILABLE')

    // Should NOT retry the original request
    expect(fetchSpy).toHaveBeenCalledTimes(2)

    // Cookies should NOT be cleared — transient backend failure
    const setCookieHeaders = res.headers.getSetCookie()
    const hasClearCookie = setCookieHeaders.some(
      (h) => h.includes('access_token') || h.includes('refresh_token')
    )

    expect(hasClearCookie).toBe(false)
  })

  it('preserves cookies and returns 503 when refresh network fails', async () => {
    setupCookieMock({
      access_token: 'expired-token',
      refresh_token: 'valid-refresh',
    })

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )
      // Refresh fetch throws (timeout, DNS, etc.)
      .mockRejectedValueOnce(new Error('AbortError: timeout'))

    const req = new NextRequest('http://localhost:3000/api/proxy/tasks')
    const params = Promise.resolve({ path: ['tasks'] })

    const res = await GET(req, { params })

    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body.code).toBe('SESSION_REFRESH_UNAVAILABLE')

    // No auth cookies modified
    const setCookieHeaders = res.headers.getSetCookie()
    const hasClearCookie = setCookieHeaders.some(
      (h) => h.includes('access_token') || h.includes('refresh_token')
    )

    expect(hasClearCookie).toBe(false)
  })

  it('returns 502 when retry request fails due to network error', async () => {
    setupCookieMock({
      access_token: 'expired-token',
      refresh_token: 'valid-refresh',
    })

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )
      .mockResolvedValueOnce(
        refreshResponse('brand-new-access', 'brand-new-refresh')
      )
      .mockRejectedValueOnce(new Error('AbortError: timeout'))

    const req = new NextRequest('http://localhost:3000/api/proxy/tasks')
    const params = Promise.resolve({ path: ['tasks'] })

    const res = await GET(req, { params })
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.code).toBe('UPSTREAM_UNAVAILABLE')

    const setCookieHeaders = res.headers.getSetCookie()
    const accessSetCookie = setCookieHeaders.find((h) =>
      h.startsWith('access_token=')
    )
    const refreshSetCookie = setCookieHeaders.find((h) =>
      h.startsWith('refresh_token=')
    )

    expect(accessSetCookie).toBeDefined()
    expect(accessSetCookie).toContain('brand-new-access')
    expect(refreshSetCookie).toBeDefined()
    expect(refreshSetCookie).toContain('brand-new-refresh')
  })

  // ---------------------------------------------------------------------------
  // No refresh token → no retry
  // ---------------------------------------------------------------------------

  it('returns clean 401 without retry when no refresh_token exists', async () => {
    setupCookieMock({ access_token: 'expired-token' })

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )

    const req = new NextRequest('http://localhost:3000/api/proxy/me')
    const params = Promise.resolve({ path: ['me'] })

    const res = await GET(req, { params })

    // Should return 401 directly
    expect(res.status).toBe(401)

    // Only one fetch — no refresh attempt
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    // access_token should be cleared
    const setCookieHeaders = res.headers.getSetCookie()
    const accessClear = setCookieHeaders.find((h) =>
      h.startsWith('access_token=')
    )

    expect(accessClear).toBeDefined()
    expect(accessClear).toContain('Expires=Thu, 01 Jan 1970')

    const refreshClear = setCookieHeaders.find((h) =>
      h.startsWith('refresh_token=')
    )

    expect(refreshClear).toBeUndefined()
  })

  // ---------------------------------------------------------------------------
  // Upstream Set-Cookie forwarding
  // ---------------------------------------------------------------------------

  it('forwards non-auth upstream Set-Cookie headers individually', async () => {
    setupCookieMock({ access_token: 'valid-token' })

    const upstreamResponse = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

    upstreamResponse.headers.append(
      'set-cookie',
      'session_id=abc123; Path=/; HttpOnly'
    )
    upstreamResponse.headers.append(
      'set-cookie',
      'tracking=xyz789; Path=/; SameSite=Lax'
    )

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(upstreamResponse)

    const req = new NextRequest('http://localhost:3000/api/proxy/data')
    const params = Promise.resolve({ path: ['data'] })

    const res = await GET(req, { params })

    const setCookieHeaders = res.headers.getSetCookie()
    const sessionCookie = setCookieHeaders.find((h) =>
      h.startsWith('session_id=')
    )
    const trackingCookie = setCookieHeaders.find((h) =>
      h.startsWith('tracking=')
    )

    expect(sessionCookie).toBe('session_id=abc123; Path=/; HttpOnly')
    expect(trackingCookie).toBe('tracking=xyz789; Path=/; SameSite=Lax')
  })

  it('filters upstream auth cookies to prevent duplicates with proxy-managed cookies', async () => {
    setupCookieMock({
      access_token: 'expired',
      refresh_token: 'valid-refresh',
    })

    // Simulate: 401 → refresh → retry
    // The retry response contains upstream auth cookies from Nest
    const retryResponse = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

    retryResponse.headers.append(
      'set-cookie',
      'access_token=old-nest-value; Path=/; HttpOnly'
    )
    retryResponse.headers.append('set-cookie', 'tracking=xyz; Path=/')

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(
        refreshResponse('proxy-new-access', 'proxy-new-refresh')
      )
      .mockResolvedValueOnce(retryResponse)

    const req = new NextRequest('http://localhost:3000/api/proxy/me')
    const params = Promise.resolve({ path: ['me'] })

    const res = await GET(req, { params })

    const setCookieHeaders = res.headers.getSetCookie()

    // Non-auth cookies from Nest should be forwarded
    const trackingCookie = setCookieHeaders.find((h) =>
      h.startsWith('tracking=')
    )

    expect(trackingCookie).toBe('tracking=xyz; Path=/')

    // Auth cookies should come from proxy (fresh values), not duplicated from Nest
    const accessCookies = setCookieHeaders.filter((h) =>
      h.startsWith('access_token=')
    )

    expect(accessCookies).toHaveLength(1)
    expect(accessCookies[0]).toContain('proxy-new-access')
  })
})
