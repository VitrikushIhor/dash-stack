import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { COOKIE_CONFIG } from '@/shared/lib/cookie-config'
import { extractSessionTokens, refreshSession } from './session-refresh'
import { SESSION_REFRESH_STATUS } from './session-refresh-status'

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('extractSessionTokens', () => {
  it('extracts auth credentials from HttpOnly Set-Cookie headers', () => {
    const headers = new Headers()

    headers.append(
      'set-cookie',
      `${COOKIE_CONFIG.ACCESS_TOKEN.name}=access-value; Path=/; HttpOnly; SameSite=Lax`
    )
    headers.append(
      'set-cookie',
      `${COOKIE_CONFIG.REFRESH_TOKEN.name}=session-value; Path=/; HttpOnly; SameSite=Lax`
    )

    expect(extractSessionTokens(headers)).toEqual({
      accessToken: 'access-value',
      refreshToken: 'session-value',
    })
  })

  it('returns null when either auth cookie is missing', () => {
    const headers = new Headers({
      'set-cookie': `${COOKIE_CONFIG.ACCESS_TOKEN.name}=access-value; Path=/; HttpOnly`,
    })

    expect(extractSessionTokens(headers)).toBeNull()
  })

  it('uses HttpOnly response cookies when refresh JSON is sanitized', async () => {
    const response = new Response(JSON.stringify({ authenticated: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

    response.headers.append(
      'set-cookie',
      `${COOKIE_CONFIG.ACCESS_TOKEN.name}=new-access; Path=/; HttpOnly; SameSite=Lax`
    )
    response.headers.append(
      'set-cookie',
      `${COOKIE_CONFIG.REFRESH_TOKEN.name}=stable-session; Path=/; HttpOnly; SameSite=Lax`
    )
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(response)

    await expect(
      refreshSession('stable-session', '8dbecb6d-2b38-45f0-aece-071554d93a9e')
    ).resolves.toEqual({
      status: SESSION_REFRESH_STATUS.SUCCESS,
      tokens: {
        accessToken: 'new-access',
        refreshToken: 'stable-session',
      },
    })
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/refresh'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Request-Id': '8dbecb6d-2b38-45f0-aece-071554d93a9e',
        }),
        redirect: 'manual',
      })
    )
  })

  it('should reject tokens in JSON when auth cookies are missing', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      Response.json({
        accessToken: 'old-access',
        refreshToken: 'old-refresh',
      })
    )

    await expect(refreshSession('json-only-session')).resolves.toEqual({
      status: SESSION_REFRESH_STATUS.INVALID_RESPONSE,
    })
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('should reject a redirect from the refresh endpoint', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: { Location: 'https://example.com/collect' },
      })
    )

    await expect(refreshSession('redirect-session')).resolves.toEqual({
      status: SESSION_REFRESH_STATUS.UNAVAILABLE,
    })
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ redirect: 'manual' })
    )
  })
})
