import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
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
      const req = createNextRequest('/dashboard')

      const res = middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        'http://localhost:3000/sign-in?redirect=%2Fdashboard'
      )
    })

    it('allows access to protected route when access_token is present', () => {
      const req = createNextRequest('/dashboard', {
        access_token: 'valid-access-token',
      })

      const res = middleware(req)

      expect(res.headers.get('location')).toBeNull()
    })

    it('allows access to protected route when ONLY refresh_token is present (Silent Refresh path)', () => {
      const req = createNextRequest('/settings', {
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
  })

  describe('Auth Routes (Login/Signup)', () => {
    it('redirects authenticated user accessing sign-in page to dashboard', () => {
      const req = createNextRequest('/sign-in', {
        access_token: 'valid-access-token',
      })

      const res = middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        'http://localhost:3000/dashboard'
      )
    })

    it('redirects user with only refresh_token accessing sign-up page to dashboard', () => {
      const req = createNextRequest('/sign-up', {
        refresh_token: 'valid-refresh-token',
      })

      const res = middleware(req)

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(
        'http://localhost:3000/dashboard'
      )
    })

    it('allows unauthenticated user to access sign-in page', () => {
      const req = createNextRequest('/sign-in')

      const res = middleware(req)

      expect(res.headers.get('location')).toBeNull()
    })
  })

  describe('Public Unprotected Routes', () => {
    it('allows any user to access public pages like verify-email', () => {
      const req = createNextRequest('/verify-email')

      const res = middleware(req)

      expect(res.headers.get('location')).toBeNull()
    })
  })
})
