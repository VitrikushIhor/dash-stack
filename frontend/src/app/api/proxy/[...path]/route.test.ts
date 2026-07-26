import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './route'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

describe('Proxy API Route (/api/proxy/[...path])', () => {
  const mockSet = vi.fn()
  const mockDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function setupCookieMock(cookiesRecord: Record<string, string> = {}) {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn((name: string) =>
        cookiesRecord[name] ? { value: cookiesRecord[name] } : undefined
      ),
      set: mockSet,
      delete: mockDelete,
    } as unknown as Awaited<ReturnType<typeof cookies>>)
  }

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
    expect(body).toEqual({ success: true })
  })

  it('performs Silent Refresh and token rotation when receiving 401 response and refresh_token is present', async () => {
    setupCookieMock({
      access_token: 'expired-access-token',
      refresh_token: 'valid-refresh-token',
    })

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      // 1st call: initial proxy request -> 401 Unauthorized
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )
      // 2nd call: token refresh request -> 200 OK with new tokens
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            accessToken: 'new-access-token-123',
            refreshToken: 'new-refresh-token-456',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      // 3rd call: retried original request with new token -> 200 OK
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: 'secret-data' }), { status: 200 })
      )

    const req = new NextRequest('http://localhost:3000/api/proxy/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'New Task' }),
    })
    const params = Promise.resolve({ path: ['tasks'] })

    const res = await POST(req, { params })
    const body = await res.json()

    // Verifies token refresh call
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      'http://localhost:8000/api/auth/refresh',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'valid-refresh-token' }),
      })
    )

    // Verifies setting rotated cookies
    expect(mockSet).toHaveBeenCalledWith(
      'access_token',
      'new-access-token-123',
      expect.any(Object)
    )
    expect(mockSet).toHaveBeenCalledWith(
      'refresh_token',
      'new-refresh-token-456',
      expect.any(Object)
    )

    // Verifies retried request with new access token
    expect(fetchSpy).toHaveBeenNthCalledWith(
      3,
      'http://localhost:8000/api/tasks',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer new-access-token-123',
        }),
      })
    )
    expect(body).toEqual({ data: 'secret-data' })
  })

  it('clears session cookies when 401 occurs and token refresh fails', async () => {
    setupCookieMock({
      access_token: 'invalid-access-token',
      refresh_token: 'invalid-refresh-token',
    })

    vi.spyOn(globalThis, 'fetch')
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

    expect(res.status).toBe(401)
    expect(mockDelete).toHaveBeenCalledWith('access_token')
    expect(mockDelete).toHaveBeenCalledWith('refresh_token')
  })
})
