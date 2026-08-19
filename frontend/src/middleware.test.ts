import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { ROUTES } from '@/shared/config'
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

describe('Next.js Route Protection Middleware', () => {
  describe('Protected Routes', () => {
    it('redirects unauthenticated user from protected path to sign-in with redirect query param', () => {
      const req = createNextRequest(ROUTES.organizations)

      const res = middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        'http://localhost:3000/sign-in?redirect=%2Forganizations'
      )
    })

    it('preserves query parameters and invite tokens when redirecting unauthenticated users to sign-in', () => {
      const req = createNextRequest(
        '/accept-invite?token=SECRET_INVITE_TOKEN_123'
      )

      const res = middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        'http://localhost:3000/sign-in?redirect=%2Faccept-invite%3Ftoken%3DSECRET_INVITE_TOKEN_123'
      )
    })

    it('allows access to protected route when access_token is present', () => {
      const req = createNextRequest(ROUTES.organizations, {
        access_token: 'valid-access-token',
      })

      const res = middleware(req)

      expect(res.headers.get('location')).toBeNull()
    })

    it('allows access to protected route when ONLY refresh_token is present (Silent Refresh path)', () => {
      const req = createNextRequest(ROUTES.settings, {
        refresh_token: 'valid-refresh-token',
      })

      const res = middleware(req)

      expect(res.headers.get('location')).toBeNull()
    })

    it('protects sub-paths of protected routes correctly', () => {
      const req = createNextRequest('/organizations/123/members')

      const res = middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        'http://localhost:3000/sign-in?redirect=%2Forganizations%2F123%2Fmembers'
      )
    })

    it('protects slug-based tenant routes like /organizations/acme/tasks', () => {
      const req = createNextRequest(ROUTES.orgTasks('acme'))

      const res = middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        'http://localhost:3000/sign-in?redirect=%2Forganizations%2Facme%2Ftasks'
      )
    })
  })

  describe('Auth Routes (Login/Signup)', () => {
    it('redirects authenticated user accessing sign-in page to organizations', () => {
      const req = createNextRequest(ROUTES.signIn, {
        access_token: 'valid-access-token',
      })

      const res = middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        'http://localhost:3000/organizations'
      )
    })

    it('redirects authenticated user to safe redirect param target', () => {
      const req = createNextRequest(
        `${ROUTES.signIn}?redirect=%2Forganizations%2Facme%2Ftasks`,
        {
          access_token: 'valid-access-token',
        }
      )

      const res = middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        'http://localhost:3000/organizations/acme/tasks'
      )
    })

    it('sanitizes malicious open redirect to fallback /organizations', () => {
      const req = createNextRequest(
        `${ROUTES.signIn}?redirect=%2F%2Fevil.com%2Fphish`,
        {
          access_token: 'valid-access-token',
        }
      )

      const res = middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        'http://localhost:3000/organizations'
      )
    })

    it('redirects user with only refresh_token accessing sign-up page to organizations', () => {
      const req = createNextRequest(ROUTES.signUp, {
        refresh_token: 'valid-refresh-token',
      })

      const res = middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        'http://localhost:3000/organizations'
      )
    })

    it('allows unauthenticated user to access sign-in page', () => {
      const req = createNextRequest(ROUTES.signIn)

      const res = middleware(req)

      expect(res.headers.get('location')).toBeNull()
    })
  })

  describe('Public Unprotected Routes', () => {
    it('allows any user to access public pages like verify-email', () => {
      const req = createNextRequest(ROUTES.verifyEmail)

      const res = middleware(req)

      expect(res.headers.get('location')).toBeNull()
    })
  })
})
