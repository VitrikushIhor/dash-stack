import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/config'
import { COOKIE_CONFIG } from '@/shared/lib/cookie-config'
import { middleware } from './middleware'

function createNextRequest(
  url: string,
  cookiesRecord: Record<string, string> = {}
): NextRequest {
  const request = new NextRequest(new URL(url, 'http://localhost:3000'))

  Object.entries(cookiesRecord).forEach(([name, value]) => {
    request.cookies.set(name, value)
  })

  return request
}

function createAccessToken(expiresAtSeconds: number): string {
  const payload = btoa(JSON.stringify({ exp: expiresAtSeconds }))

  return `header.${payload}.signature`
}

function refreshResponse(accessToken: string, refreshToken: string): Response {
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

describe('Next.js Route Protection Middleware', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Protected Routes', () => {
    it('redirects unauthenticated user from protected path to sign-in with redirect query param', async () => {
      const req = createNextRequest(ROUTES.organizations)

      const res = await middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        'http://localhost:3000/sign-in?redirect=%2Forganizations'
      )
    })

    it('preserves query parameters and invite tokens when redirecting unauthenticated users to sign-in', async () => {
      const req = createNextRequest(
        '/accept-invite?token=SECRET_INVITE_TOKEN_123'
      )

      const res = await middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        'http://localhost:3000/sign-in?redirect=%2Faccept-invite%3Ftoken%3DSECRET_INVITE_TOKEN_123'
      )
      expect(res.headers.get('Referrer-Policy')).toBe('no-referrer')
    })

    it('sets no-referrer on the token-bearing invitation page', async () => {
      const req = createNextRequest(
        '/accept-invite?token=SECRET_INVITE_TOKEN_123',
        {
          access_token: createAccessToken(Math.floor(Date.now() / 1000) + 60),
        }
      )

      const res = await middleware(req)

      expect(res.headers.get('Referrer-Policy')).toBe('no-referrer')
    })

    it('allows access to protected route when unexpired access_token is present', async () => {
      const req = createNextRequest(ROUTES.organizations, {
        access_token: createAccessToken(Math.floor(Date.now() / 1000) + 60),
      })

      const res = await middleware(req)

      expect(res.headers.get('location')).toBeNull()
    })

    it('refreshes before protected SSR when only refresh_token is present', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        refreshResponse('new-access-token', 'stable-session-credential')
      )
      const req = createNextRequest(ROUTES.settings, {
        refresh_token: 'stable-session-credential',
      })

      const res = await middleware(req)

      expect(res.headers.get('location')).toBeNull()
      expect(res.cookies.get('access_token')?.value).toBe('new-access-token')
      expect(res.cookies.get('refresh_token')?.value).toBe(
        'stable-session-credential'
      )
      expect(res.headers.get('x-middleware-request-cookie')).toContain(
        'access_token=new-access-token'
      )
    })

    it('refreshes expired access token before a Server Action request', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          refreshResponse('recovered-access-token', 'stable-session-credential')
        )
      const req = createNextRequest(ROUTES.vocabSettings, {
        access_token: createAccessToken(Math.floor(Date.now() / 1000) - 60),
        refresh_token: 'stable-session-credential',
      })

      const res = await middleware(req)

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/refresh',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ token: 'stable-session-credential' }),
        })
      )
      expect(res.cookies.get('access_token')?.value).toBe(
        'recovered-access-token'
      )
      expect(res.headers.get('x-middleware-request-cookie')).toContain(
        'access_token=recovered-access-token'
      )
    })

    it('redirects to sign-in and clears cookies when recovery is rejected', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'UNAUTHORIZED' }), { status: 401 })
      )
      const req = createNextRequest(ROUTES.vocabSettings, {
        access_token: createAccessToken(Math.floor(Date.now() / 1000) - 60),
        refresh_token: 'revoked-session-credential',
      })

      const res = await middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        `http://localhost:3000/sign-in?redirect=${encodeURIComponent(ROUTES.vocabSettings)}`
      )
      expect(res.headers.getSetCookie()).toEqual(
        expect.arrayContaining([
          expect.stringContaining('access_token='),
          expect.stringContaining('refresh_token='),
        ])
      )
    })

    it('shows a retry page and preserves cookies when refresh is unavailable', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(null, { status: 503 })
      )
      const req = createNextRequest(`${ROUTES.vocabSettings}?tab=profile`, {
        access_token: 'invalid-access-token',
        refresh_token: 'stable-session-credential',
      })

      const res = await middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        `http://localhost:3000/session-unavailable?returnTo=${encodeURIComponent(`${ROUTES.vocabSettings}?tab=profile`)}`
      )
      expect(res.headers.getSetCookie()).toEqual([])
    })

    it('protects slug-based tenant routes like /organizations/acme/tasks', async () => {
      const req = createNextRequest(ROUTES.orgTasks('acme'))

      const res = await middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        'http://localhost:3000/sign-in?redirect=%2Forganizations%2Facme%2Ftasks'
      )
    })
  })

  describe('Auth Routes', () => {
    it.each([
      ROUTES.signIn,
      ROUTES.signUp,
      ROUTES.forgotPassword,
      `${ROUTES.signIn}?redirect=%2Forganizations`,
      `${ROUTES.signIn}?redirect=%2F%2Fevil.com`,
    ])(
      'should_allow_auth_page_%s_when_access_exp_does_not_prove_session_authority',
      async (path) => {
        const req = createNextRequest(path, {
          access_token: createAccessToken(Math.floor(Date.now() / 1000) + 60),
          refresh_token: 'possibly-revoked-credential',
        })
        const res = await middleware(req)
        expect(res.headers.get('location')).toBeNull()
      }
    )

    it('allows sign-up access when only refresh_token is present', async () => {
      const req = createNextRequest(ROUTES.signUp, {
        refresh_token: 'stable-session-credential',
      })

      const res = await middleware(req)

      expect(res.headers.get('location')).toBeNull()
    })

    it('allows unauthenticated user to access sign-in page', async () => {
      const res = await middleware(createNextRequest(ROUTES.signIn))

      expect(res.headers.get('location')).toBeNull()
    })
  })

  it.each(['/organizations-extra', '/vocab/decks/deck-1/editor'])(
    'should_allow_public_path_when_it_only_resembles_a_protected_route: %s',
    async (path) => {
      const res = await middleware(createNextRequest(path))

      expect(res.headers.get('location')).toBeNull()
    }
  )

  it('should_preserve_unrelated_request_cookies_when_session_recovers', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      refreshResponse('new-access', 'new-refresh')
    )

    const res = await middleware(
      createNextRequest(ROUTES.settings, {
        refresh_token: 'previous-refresh',
        sidebar_state: 'true',
      })
    )

    expect(res.headers.get('x-middleware-request-cookie')).toContain(
      'sidebar_state=true'
    )
    expect(res.headers.get('x-middleware-request-cookie')).toContain(
      'refresh_token=new-refresh'
    )
  })

  it('should_preserve_cookies_when_refresh_response_has_no_credentials', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      Response.json({ authenticated: true })
    )

    const res = await middleware(
      createNextRequest(ROUTES.settings, {
        refresh_token: 'stable-credential',
      })
    )

    expect(res.headers.get('location')).toBe(
      `http://localhost:3000/session-unavailable?returnTo=${encodeURIComponent(ROUTES.settings)}`
    )
    expect(res.headers.getSetCookie()).toEqual([])
  })

  it('should_continue_public_page_when_refresh_is_unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 503 })
    )

    const res = await middleware(
      createNextRequest('/vocab/catalog', {
        refresh_token: 'stable-credential',
      })
    )

    expect(res.headers.get('location')).toBeNull()
    expect(res.headers.getSetCookie()).toEqual([])
  })

  it('renders the unavailable page without repeating refresh', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockClear()
    const req = createNextRequest(
      '/session-unavailable?returnTo=%2Fvocab%2Fsettings',
      {
        refresh_token: 'stable-session-credential',
      }
    )

    const res = await middleware(req)

    expect(res.status).toBe(200)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('allows any user to access public pages like verify-email', async () => {
    const res = await middleware(createNextRequest(ROUTES.verifyEmail))

    expect(res.headers.get('location')).toBeNull()
  })
})
