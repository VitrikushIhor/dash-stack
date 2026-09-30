import { NextRequest } from 'next/server'
import { createHash } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  oauthLinkFlowSchema,
  sessionBinding,
} from '@/shared/api/oauth/oauth-link-flow'
import { GET, POST } from './route'

describe('OAuth start route', () => {
  const previousDomain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN
  const previousClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
  const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL
  const previousApiUrl = process.env.API_URL

  afterEach(() => {
    if (previousDomain === undefined)
      delete process.env.NEXT_PUBLIC_AUTH0_DOMAIN
    else process.env.NEXT_PUBLIC_AUTH0_DOMAIN = previousDomain
    if (previousClientId === undefined)
      delete process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
    else process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID = previousClientId
    if (previousAppUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL
    else process.env.NEXT_PUBLIC_APP_URL = previousAppUrl
    if (previousApiUrl === undefined) delete process.env.API_URL
    else process.env.API_URL = previousApiUrl
    vi.unstubAllEnvs()
  })

  it('should_create_distinct_state_and_pkce_challenge_for_parallel_tabs', () => {
    process.env.NEXT_PUBLIC_AUTH0_DOMAIN = 'tenant.auth0.com'
    process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID = 'client-id'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    const request = new NextRequest(
      'http://localhost:3000/api/auth/oauth/start?connection=github'
    )

    const first = GET(request)
    const second = GET(request)
    const firstUrl = new URL(first.headers.get('location') ?? '')
    const secondUrl = new URL(second.headers.get('location') ?? '')
    const firstState = firstUrl.searchParams.get('state')
    const secondState = secondUrl.searchParams.get('state')

    expect(firstUrl.searchParams.get('response_type')).toBe('code')
    expect(firstUrl.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3000/api/auth/oauth/callback'
    )
    expect(firstUrl.searchParams.get('code_challenge_method')).toBe('S256')
    expect(firstState).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(secondState).not.toBe(firstState)
    const verifier = first.cookies.get(`oauth_flow_${firstState}`)?.value
    expect(verifier).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(firstUrl.searchParams.get('code_challenge')).toBe(
      createHash('sha256')
        .update(verifier ?? '')
        .digest('base64url')
    )
  })

  it('should_reject_unapproved_connection_without_redirect', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/auth/oauth/start?connection=attacker'
    )

    const response = GET(request)

    expect(response.status).toBe(503)
    await expect(response.text()).resolves.toBe('OAuth is unavailable')
    expect(response.headers.get('location')).toBeNull()
  })

  it('should_return_503_for_malformed_frontend_url', () => {
    process.env.NEXT_PUBLIC_AUTH0_DOMAIN = 'tenant.auth0.com'
    process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID = 'client-id'
    process.env.NEXT_PUBLIC_APP_URL = 'not a URL'

    const response = GET(
      new NextRequest(
        'http://localhost:3000/api/auth/oauth/start?connection=github'
      )
    )

    expect(response.status).toBe(503)
  })

  it('should_reject_missing_production_backend_configuration_without_redirect', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('API_URL', undefined)
    process.env.NEXT_PUBLIC_AUTH0_DOMAIN = 'tenant.auth0.com'
    process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID = 'client-id'
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com'

    const response = GET(
      new NextRequest(
        'https://app.example.com/api/auth/oauth/start?connection=github'
      )
    )

    expect(response.status).toBe(503)
    expect(response.headers.get('location')).toBeNull()
  })

  it('should_use_host_only_secure_cookie_in_production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    process.env.NEXT_PUBLIC_AUTH0_DOMAIN = 'tenant.auth0.com'
    process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID = 'client-id'
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com'
    process.env.API_URL = 'https://api.example.com'
    const request = new NextRequest(
      'https://app.example.com/api/auth/oauth/start?connection=github'
    )

    const response = GET(request)
    const state = new URL(
      response.headers.get('location') ?? ''
    ).searchParams.get('state')
    const cookie = response.cookies.get(`__Host-oauth_flow_${state}`)

    expect(cookie?.secure).toBe(true)
    expect(cookie?.httpOnly).toBe(true)
    expect(cookie?.path).toBe('/')
    expect(cookie?.sameSite).toBe('lax')
    expect(cookie?.domain).toBeUndefined()
  })
  it('should_bind_link_confirmation_to_current_session_and_force_provider_login', async () => {
    process.env.API_URL = 'http://localhost:8000'
    process.env.NEXT_PUBLIC_AUTH0_DOMAIN = 'tenant.auth0.com'
    process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID = 'client-id'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    const response = await POST(
      new NextRequest('http://localhost:3000/api/auth/oauth/start', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
          cookie: 'refresh_token=current-session',
        },
        body: 'connection=github&returnTo=https://attacker.example',
      })
    )
    expect(response.status).toBe(303)
    const destination = new URL(response.headers.get('location') ?? '')
    expect(destination.searchParams.get('prompt')).toBe('login')
    const cookie = response.cookies.get(
      `oauth_flow_${destination.searchParams.get('state')}`
    )
    const flow = oauthLinkFlowSchema.parse(JSON.parse(cookie?.value ?? 'null'))
    expect(flow.sessionHash).toBe(sessionBinding('current-session'))
    expect(flow.returnTo).toBe('/user/settings/accounts')
    expect(cookie?.value).not.toContain('current-session')
    expect(cookie?.httpOnly).toBe(true)
  })

  it('should_reject_cross_origin_link_initiation', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    const response = await POST(
      new NextRequest('http://localhost:3000/api/auth/oauth/start', {
        method: 'POST',
        headers: {
          origin: 'https://attacker.example',
          cookie: 'refresh_token=current-session',
        },
        body: 'connection=github',
      })
    )
    expect(response.status).toBe(403)
  })
  it('should_use_registered_public_host_when_next_internal_url_uses_localhost', async () => {
    process.env.NEXT_PUBLIC_AUTH0_DOMAIN = 'tenant.auth0.com'
    process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID = 'client-id'
    process.env.NEXT_PUBLIC_APP_URL = 'http://127.0.0.1:3000'
    process.env.API_URL = 'http://localhost:8000'
    const response = await POST(
      new NextRequest('http://localhost:3000/api/auth/oauth/start', {
        method: 'POST',
        headers: {
          host: '127.0.0.1:3000',
          origin: 'http://127.0.0.1:3000',
          cookie: 'refresh_token=current-session',
        },
        body: 'connection=github',
      })
    )
    expect(response.status).toBe(303)
    expect(
      new URL(response.headers.get('location') ?? '').searchParams.get(
        'redirect_uri'
      )
    ).toBe('http://127.0.0.1:3000/api/auth/oauth/callback')
  })
})
