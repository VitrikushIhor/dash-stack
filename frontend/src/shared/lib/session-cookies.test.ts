import { cookies } from 'next/headers'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AUTH_COOKIE_CONFIG,
  clearAuthCookies,
  getCookieOptions,
  setAuthCookies,
} from './session-cookies'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

describe('session-cookies', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getCookieOptions', () => {
    it('returns default cookie options for development environment', () => {
      process.env.NODE_ENV = 'development'
      delete process.env.COOKIE_SECURE

      const options = getCookieOptions(900)

      expect(options).toEqual({
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 900,
        path: '/',
      })
    })

    it('enforces secure cookies when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production'

      const options = getCookieOptions(900)

      expect(options.secure).toBe(true)
    })

    it('enforces secure cookies when COOKIE_SECURE env variable is true', () => {
      process.env.NODE_ENV = 'development'
      process.env.COOKIE_SECURE = 'true'

      const options = getCookieOptions(900)

      expect(options.secure).toBe(true)
    })
  })

  describe('setAuthCookies', () => {
    it('sets access_token cookie when accessToken is provided', async () => {
      const mockSet = vi.fn()
      vi.mocked(cookies).mockResolvedValue({
        set: mockSet,
      } as unknown as Awaited<ReturnType<typeof cookies>>)

      await setAuthCookies({ accessToken: 'test-access-token' })

      expect(mockSet).toHaveBeenCalledWith(
        AUTH_COOKIE_CONFIG.ACCESS_TOKEN.name,
        'test-access-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 60 * 15,
          path: '/',
        })
      )
    })

    it('sets refresh_token cookie when refreshToken is provided', async () => {
      const mockSet = vi.fn()
      vi.mocked(cookies).mockResolvedValue({
        set: mockSet,
      } as unknown as Awaited<ReturnType<typeof cookies>>)

      await setAuthCookies({ refreshToken: 'test-refresh-token' })

      expect(mockSet).toHaveBeenCalledWith(
        AUTH_COOKIE_CONFIG.REFRESH_TOKEN.name,
        'test-refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        })
      )
    })

    it('sets both cookies when both access and refresh tokens are provided', async () => {
      const mockSet = vi.fn()
      vi.mocked(cookies).mockResolvedValue({
        set: mockSet,
      } as unknown as Awaited<ReturnType<typeof cookies>>)

      await setAuthCookies({
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
      })

      expect(mockSet).toHaveBeenCalledTimes(2)
      expect(mockSet).toHaveBeenNthCalledWith(
        1,
        'access_token',
        'access-123',
        expect.any(Object)
      )
      expect(mockSet).toHaveBeenNthCalledWith(
        2,
        'refresh_token',
        'refresh-456',
        expect.any(Object)
      )
    })
  })

  describe('clearAuthCookies', () => {
    it('deletes both access_token and refresh_token cookies', async () => {
      const mockDelete = vi.fn()
      vi.mocked(cookies).mockResolvedValue({
        delete: mockDelete,
      } as unknown as Awaited<ReturnType<typeof cookies>>)

      await clearAuthCookies()

      expect(mockDelete).toHaveBeenCalledWith('access_token')
      expect(mockDelete).toHaveBeenCalledWith('refresh_token')
    })
  })
})
