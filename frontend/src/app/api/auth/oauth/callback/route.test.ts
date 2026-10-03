import { NextRequest, NextResponse } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sessionBinding } from '@/shared/api/oauth/oauth-link-flow'
import { forwardProxyRequestFacade } from '@/shared/api/proxy'
import { GET } from './route'

vi.mock('@/shared/api/proxy', () => ({ forwardProxyRequestFacade: vi.fn() }))

describe('OAuth callback route', () => {
  const state = 's'.repeat(43)
  const verifier = 'v'.repeat(43)
  const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL
  const previousApiUrl = process.env.API_URL

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    process.env.API_URL = 'http://localhost:8000'
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = previousAppUrl
    process.env.API_URL = previousApiUrl
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('should_reject_callback_when_state_cookie_is_missing', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const request = new NextRequest(
      `http://localhost:3000/api/auth/oauth/callback?state=${state}&code=code`
    )

    const response = await GET(request)

    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/sign-in'
    )
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('should_consume_matching_flow_cookie_and_set_session_after_code_exchange', async () => {
    const headers = new Headers()
    headers.append('set-cookie', 'access_token=access-secret; HttpOnly; Path=/')
    headers.append(
      'set-cookie',
      'refresh_token=refresh-secret; HttpOnly; Path=/'
    )
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200, headers }))
    const request = new NextRequest(
      `http://localhost:3000/api/auth/oauth/callback?state=${state}&code=code`,
      { headers: { cookie: `oauth_flow_${state}=${verifier}` } }
    )

    const response = await GET(request)

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8000/api/auth/oauth/code',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ code: 'code', codeVerifier: verifier }),
      })
    )
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/vocab/decks?auth-session=changed'
    )
    expect(response.cookies.get('access_token')?.value).toBe('access-secret')
    expect(response.cookies.get('refresh_token')?.value).toBe('refresh-secret')
    expect(response.cookies.get(`oauth_flow_${state}`)?.maxAge).toBe(0)
  })

  it('should_fail_safely_for_malformed_frontend_url', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'not a URL'
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const response = await GET(
      new NextRequest(
        `http://localhost:3000/api/auth/oauth/callback?state=${state}&code=code`,
        { headers: { cookie: `oauth_flow_${state}=${verifier}` } }
      )
    )

    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/sign-in'
    )
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('should_not_fallback_to_local_backend_in_production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('API_URL', undefined)
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com'
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const request = new NextRequest(
      `https://app.example.com/api/auth/oauth/callback?state=${state}&code=code`,
      { headers: { cookie: `__Host-oauth_flow_${state}=${verifier}` } }
    )

    const response = await GET(request)

    expect(response.headers.get('location')).toBe(
      'https://app.example.com/sign-in'
    )
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('should_clear_flow_cookie_on_provider_cancellation', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const request = new NextRequest(
      `http://localhost:3000/api/auth/oauth/callback?state=${state}&error=access_denied`,
      { headers: { cookie: `oauth_flow_${state}=${verifier}` } }
    )

    const response = await GET(request)

    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/sign-in'
    )
    expect(response.cookies.get(`oauth_flow_${state}`)?.maxAge).toBe(0)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('should_reject_oversized_code_without_calling_backend', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const request = new NextRequest(
      `http://localhost:3000/api/auth/oauth/callback?state=${state}&code=${'x'.repeat(2049)}`,
      { headers: { cookie: `oauth_flow_${state}=${verifier}` } }
    )

    const response = await GET(request)

    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/sign-in'
    )
    expect(fetchSpy).not.toHaveBeenCalled()
  })
  it('should_link_only_the_session_that_started_the_flow_without_replacing_identity', async () => {
    vi.mocked(forwardProxyRequestFacade).mockResolvedValue(
      new NextResponse('{}', { status: 200 })
    )
    const flow = JSON.stringify({
      verifier,
      sessionHash: sessionBinding('current-session'),
      provider: 'google',
      returnTo: '/user/settings/accounts',
    })
    const request = new NextRequest(
      `http://localhost:3000/api/auth/oauth/callback?state=${state}&code=code`,
      {
        headers: {
          cookie: `oauth_flow_${state}=${encodeURIComponent(flow)}; refresh_token=current-session`,
        },
      }
    )
    const response = await GET(request)
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/user/settings/accounts?link=success'
    )
    expect(response.cookies.get(`oauth_flow_${state}`)?.maxAge).toBe(0)
    const forwarded = vi.mocked(forwardProxyRequestFacade).mock.calls[0][0]
    expect(await forwarded.json()).toEqual({
      code: 'code',
      codeVerifier: verifier,
      provider: 'google',
    })
    expect(response.cookies.get('refresh_token')).toBeUndefined()
  })

  it('should_reject_account_link_when_session_changed_during_oauth', async () => {
    const flow = JSON.stringify({
      verifier,
      sessionHash: sessionBinding('previous-session'),
      provider: 'google',
      returnTo: '/user/settings/accounts',
    })
    const response = await GET(
      new NextRequest(
        `http://localhost:3000/api/auth/oauth/callback?state=${state}&code=code`,
        {
          headers: {
            cookie: `oauth_flow_${state}=${encodeURIComponent(flow)}; refresh_token=another-session`,
          },
        }
      )
    )
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/user/settings/accounts?link=failed'
    )
    expect(forwardProxyRequestFacade).not.toHaveBeenCalled()
  })
})
