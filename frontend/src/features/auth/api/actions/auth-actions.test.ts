import { cookies } from 'next/headers'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { serverApi } from '@/shared/api/server'
import {
  COOKIE_CONFIG,
  clearAuthCookies,
  setAuthCookies,
} from '@/shared/lib/session-cookies'
import { forgotPasswordAction } from './forgot-password.action'
import { logoutAction } from './logout.action'
import { oauthExchangeAction } from './oauth-exchange.action'
import { resetPasswordAction } from './reset-password.action'
import { signInAction } from './sign-in.action'
import { signUpAction } from './sign-up.action'
import { verifyEmailAction } from './verify-email.action'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@/shared/api/server', () => ({
  serverApi: {
    post: vi.fn(),
  },
}))

vi.mock('@/shared/lib/session-cookies', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/lib/session-cookies')>()
  return {
    ...actual,
    setAuthCookies: vi.fn(),
    clearAuthCookies: vi.fn(),
  }
})

describe('Auth Server Actions', () => {
  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signInAction', () => {
    it('calls serverApi.post with valid credentials, sets cookies, and returns success ActionState', async () => {
      vi.mocked(serverApi.post).mockResolvedValueOnce(mockTokens)

      const credentials = {
        email: 'user@example.com',
        password: 'password123',
      }
      const result = await signInAction(credentials)

      expect(serverApi.post).toHaveBeenCalledWith('/auth/login', credentials, {
        skipAuth: true,
      })
      expect(setAuthCookies).toHaveBeenCalledWith(mockTokens)
      expect(result).toEqual({
        success: true,
        data: mockTokens,
      })
    })

    it('returns validation failure when email is invalid', async () => {
      const result = await signInAction({
        email: 'not-an-email',
        password: 'password123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Validation failed')
      }
      expect(serverApi.post).not.toHaveBeenCalled()
    })
  })

  describe('signUpAction', () => {
    it('calls serverApi.post with sign up data and returns success ActionState', async () => {
      const response = { message: 'User registered' }
      vi.mocked(serverApi.post).mockResolvedValueOnce(response)

      const input = {
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      }
      const result = await signUpAction(input)

      expect(serverApi.post).toHaveBeenCalledWith('/auth/signup', input, {
        skipAuth: true,
      })
      expect(result).toEqual({
        success: true,
        data: response,
      })
    })

    it('returns validation failure when passwords do not match', async () => {
      const result = await signUpAction({
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword123',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Validation failed')
        expect(result.validationMessages).toContain("Passwords don't match.")
      }
      expect(serverApi.post).not.toHaveBeenCalled()
    })
  })

  describe('verifyEmailAction', () => {
    it('calls serverApi.post with token, sets cookies, and returns success ActionState', async () => {
      vi.mocked(serverApi.post).mockResolvedValueOnce(mockTokens)

      const result = await verifyEmailAction({
        token: 'verification-token-123',
      })

      expect(serverApi.post).toHaveBeenCalledWith(
        '/auth/verify-email',
        { token: 'verification-token-123' },
        { skipAuth: true }
      )
      expect(setAuthCookies).toHaveBeenCalledWith(mockTokens)
      expect(result).toEqual({
        success: true,
        data: mockTokens,
      })
    })

    it('returns validation failure when token is empty', async () => {
      const result = await verifyEmailAction({ token: '' })
      expect(result.success).toBe(false)
      expect(serverApi.post).not.toHaveBeenCalled()
    })
  })

  describe('logoutAction', () => {
    it('calls logout endpoint when refresh token is present, clears cookies, and returns success ActionState', async () => {
      const mockGet = vi
        .fn()
        .mockReturnValue({ value: 'existing-refresh-token' })
      vi.mocked(cookies).mockResolvedValueOnce({
        get: mockGet,
      } as unknown as Awaited<ReturnType<typeof cookies>>)
      vi.mocked(serverApi.post).mockResolvedValueOnce({ message: 'Logged out' })

      const result = await logoutAction()

      expect(mockGet).toHaveBeenCalledWith(COOKIE_CONFIG.REFRESH_TOKEN.name)
      expect(serverApi.post).toHaveBeenCalledWith('/auth/logout', {
        refreshToken: 'existing-refresh-token',
      })
      expect(clearAuthCookies).toHaveBeenCalled()
      expect(result).toEqual({
        success: true,
        data: { message: 'Logged out successfully' },
      })
    })

    it('clears cookies and returns success ActionState even if logout endpoint throws', async () => {
      const mockGet = vi
        .fn()
        .mockReturnValue({ value: 'existing-refresh-token' })
      vi.mocked(cookies).mockResolvedValueOnce({
        get: mockGet,
      } as unknown as Awaited<ReturnType<typeof cookies>>)
      vi.mocked(serverApi.post).mockRejectedValueOnce(
        new Error('Network error')
      )

      const result = await logoutAction()

      expect(clearAuthCookies).toHaveBeenCalled()
      expect(result).toEqual({
        success: true,
        data: { message: 'Logged out successfully' },
      })
    })

    it('clears cookies without calling backend if no refresh token exists', async () => {
      const mockGet = vi.fn().mockReturnValue(undefined)
      vi.mocked(cookies).mockResolvedValueOnce({
        get: mockGet,
      } as unknown as Awaited<ReturnType<typeof cookies>>)

      const result = await logoutAction()

      expect(serverApi.post).not.toHaveBeenCalled()
      expect(clearAuthCookies).toHaveBeenCalled()
      expect(result).toEqual({
        success: true,
        data: { message: 'Logged out successfully' },
      })
    })
  })

  describe('forgotPasswordAction', () => {
    it('calls serverApi.post with valid email and returns success ActionState', async () => {
      const response = { message: 'Reset email sent' }
      vi.mocked(serverApi.post).mockResolvedValueOnce(response)

      const result = await forgotPasswordAction({ email: 'user@example.com' })

      expect(serverApi.post).toHaveBeenCalledWith(
        '/auth/forgot-password',
        { email: 'user@example.com' },
        { skipAuth: true }
      )
      expect(result).toEqual({
        success: true,
        data: response,
      })
    })

    it('returns validation failure for empty email', async () => {
      const result = await forgotPasswordAction({ email: '' })
      expect(result.success).toBe(false)
      expect(serverApi.post).not.toHaveBeenCalled()
    })
  })

  describe('resetPasswordAction', () => {
    it('calls serverApi.post with token and valid password, and returns success ActionState', async () => {
      const response = { message: 'Password updated' }
      vi.mocked(serverApi.post).mockResolvedValueOnce(response)

      const result = await resetPasswordAction({
        token: 'reset-token-abc',
        password: 'new-password-123',
        confirmPassword: 'new-password-123',
      })

      expect(serverApi.post).toHaveBeenCalledWith(
        '/auth/reset-password',
        { token: 'reset-token-abc', password: 'new-password-123' },
        { skipAuth: true }
      )
      expect(result).toEqual({
        success: true,
        data: response,
      })
    })

    it('returns validation failure when passwords mismatch', async () => {
      const result = await resetPasswordAction({
        token: 'reset-token-abc',
        password: 'new-password-123',
        confirmPassword: 'mismatched-password',
      })

      expect(result.success).toBe(false)
      expect(serverApi.post).not.toHaveBeenCalled()
    })
  })

  describe('oauthExchangeAction', () => {
    it('calls serverApi.post with token, sets auth cookies, and returns success ActionState', async () => {
      vi.mocked(serverApi.post).mockResolvedValueOnce(mockTokens)

      const result = await oauthExchangeAction({
        token: 'oauth-exchange-code-xyz',
      })

      expect(serverApi.post).toHaveBeenCalledWith(
        '/auth/oauth/exchange',
        { token: 'oauth-exchange-code-xyz' },
        { skipAuth: true }
      )
      expect(setAuthCookies).toHaveBeenCalledWith(mockTokens)
      expect(result).toEqual({
        success: true,
        data: mockTokens,
      })
    })

    it('returns validation failure when token is empty', async () => {
      const result = await oauthExchangeAction({ token: '' })
      expect(result.success).toBe(false)
      expect(serverApi.post).not.toHaveBeenCalled()
    })
  })
})
