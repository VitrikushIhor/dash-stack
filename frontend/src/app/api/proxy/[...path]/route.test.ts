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
        new Response(
          JSON.stringify({
            accessToken: 'new-access-token-123',
            refreshToken: 'new-refresh-token-456',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
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
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            accessToken: 'fresh-access',
            refreshToken: 'fresh-refresh',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
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
        new Response(
          JSON.stringify({
            accessToken: 'brand-new-access',
            refreshToken: 'brand-new-refresh',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
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

  it('preserves cookies and returns 401 when refresh endpoint returns 500 (transient error)', async () => {
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

    // Returns the original 401
    expect(res.status).toBe(401)

    // Should NOT retry the original request
    expect(fetchSpy).toHaveBeenCalledTimes(2)

    // Cookies should NOT be cleared — transient backend failure
    const setCookieHeaders = res.headers.getSetCookie()
    const hasClearCookie = setCookieHeaders.some(
      (h) => h.includes('access_token') || h.includes('refresh_token')
    )
    expect(hasClearCookie).toBe(false)
  })

  it('preserves cookies and returns 401 when refresh network fails', async () => {
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

    // Returns the original 401 (not 502)
    expect(res.status).toBe(401)

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
        new Response(
          JSON.stringify({
            accessToken: 'brand-new-access',
            refreshToken: 'brand-new-refresh',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
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
        new Response(
          JSON.stringify({
            accessToken: 'proxy-new-access',
            refreshToken: 'proxy-new-refresh',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
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
