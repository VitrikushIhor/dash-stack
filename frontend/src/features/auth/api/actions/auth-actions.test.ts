import { cookies } from 'next/headers'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { COOKIE_CONFIG, clearAuthCookies } from '@/shared/lib/session-cookies'
import { authServerApi } from '../auth-api.server'
import { forgotPasswordAction } from './forgot-password.action'
import { logoutAction } from './logout.action'
import { oauthExchangeAction } from './oauth-exchange.action'
import { resetPasswordAction } from './reset-password.action'
import { signInAction } from './sign-in.action'
import { signUpAction } from './sign-up.action'
import { verifyEmailAction } from './verify-email.action'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi
    .fn()
    .mockResolvedValue(new Headers({ 'user-agent': 'Browser test agent' })),
}))

vi.mock('../auth-api.server', () => ({
  authServerApi: {
    login: vi.fn(),
    signup: vi.fn(),
    verifyEmail: vi.fn(),
    logout: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    oauthExchange: vi.fn(),
  },
}))

vi.mock('@/shared/lib/session-cookies', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/lib/session-cookies')>()

  return {
    ...actual,
    clearAuthCookies: vi.fn(),
  }
})

describe('Auth Server Actions', () => {
  const authenticated = { authenticated: true as const }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signInAction', () => {
    it('calls serverApi.post with valid credentials, sets cookies, and returns success ActionState', async () => {
      vi.mocked(authServerApi.login).mockResolvedValueOnce(authenticated)

      const credentials = {
        email: 'user@example.com',
        password: 'password123',
      }
      const result = await signInAction(credentials)

      expect(authServerApi.login).toHaveBeenCalledWith(
        credentials,
        'Browser test agent'
      )
      expect(result).toEqual({
        success: true,
        data: { authenticated: true },
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
      expect(authServerApi.login).not.toHaveBeenCalled()
    })
  })

  describe('signUpAction', () => {
    it('calls serverApi.post with sign up data and returns success ActionState', async () => {
      const response = { message: 'User registered' }

      vi.mocked(authServerApi.signup).mockResolvedValueOnce(response)

      const input = {
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      }
      const result = await signUpAction(input)

      expect(authServerApi.signup).toHaveBeenCalledWith({
        email: input.email,
        password: input.password,
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
      expect(authServerApi.signup).not.toHaveBeenCalled()
    })
  })

  describe('verifyEmailAction', () => {
    it('calls serverApi.post with token, sets cookies, and returns success ActionState', async () => {
      vi.mocked(authServerApi.verifyEmail).mockResolvedValueOnce(authenticated)

      const result = await verifyEmailAction({
        token: 'verification-token-123',
      })

      expect(authServerApi.verifyEmail).toHaveBeenCalledWith(
        'verification-token-123'
      )
      expect(result).toEqual({
        success: true,
        data: { authenticated: true },
      })
    })

    it('returns validation failure when token is empty', async () => {
      const result = await verifyEmailAction({ token: '' })

      expect(result.success).toBe(false)
      expect(authServerApi.verifyEmail).not.toHaveBeenCalled()
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
      vi.mocked(authServerApi.logout).mockResolvedValueOnce({
        message: 'Logged out',
      })

      const result = await logoutAction()

      expect(mockGet).toHaveBeenCalledWith(COOKIE_CONFIG.REFRESH_TOKEN.name)
      expect(authServerApi.logout).toHaveBeenCalledWith(
        'existing-refresh-token'
      )
      expect(clearAuthCookies).toHaveBeenCalled()
      expect(result).toEqual({
        success: true,
        data: { message: 'Logged out successfully' },
      })
    })

    it('clears local cookies and reports failure when server revocation fails', async () => {
      const mockGet = vi
        .fn()
        .mockReturnValue({ value: 'existing-refresh-token' })

      vi.mocked(cookies).mockResolvedValueOnce({
        get: mockGet,
      } as unknown as Awaited<ReturnType<typeof cookies>>)
      vi.mocked(authServerApi.logout).mockRejectedValueOnce(
        new Error('Network error')
      )

      const result = await logoutAction()

      expect(clearAuthCookies).toHaveBeenCalled()
      expect(result).toEqual({
        success: false,
        error: 'Network error',
      })
    })

    it('clears cookies without calling backend if no refresh token exists', async () => {
      const mockGet = vi.fn().mockReturnValue(undefined)

      vi.mocked(cookies).mockResolvedValueOnce({
        get: mockGet,
      } as unknown as Awaited<ReturnType<typeof cookies>>)

      const result = await logoutAction()

      expect(authServerApi.logout).not.toHaveBeenCalled()
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

      vi.mocked(authServerApi.forgotPassword).mockResolvedValueOnce(response)

      const result = await forgotPasswordAction({ email: 'user@example.com' })

      expect(authServerApi.forgotPassword).toHaveBeenCalledWith(
        'user@example.com'
      )
      expect(result).toEqual({
        success: true,
        data: response,
      })
    })

    it('returns validation failure for empty email', async () => {
      const result = await forgotPasswordAction({ email: '' })

      expect(result.success).toBe(false)
      expect(authServerApi.forgotPassword).not.toHaveBeenCalled()
    })
  })

  describe('resetPasswordAction', () => {
    it('calls serverApi.post with token and valid password, and returns success ActionState', async () => {
      const response = { message: 'Password updated' }

      vi.mocked(authServerApi.resetPassword).mockResolvedValueOnce(response)

      const result = await resetPasswordAction({
        token: 'reset-token-abc',
        password: 'new-password-123',
        confirmPassword: 'new-password-123',
      })

      expect(authServerApi.resetPassword).toHaveBeenCalledWith({
        token: 'reset-token-abc',
        password: 'new-password-123',
      })
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
      expect(authServerApi.resetPassword).not.toHaveBeenCalled()
    })
  })

  describe('oauthExchangeAction', () => {
    it('calls serverApi.post with token, sets auth cookies, and returns success ActionState', async () => {
      vi.mocked(authServerApi.oauthExchange).mockResolvedValueOnce(
        authenticated
      )

      const result = await oauthExchangeAction({
        token: 'oauth-exchange-code-xyz',
      })

      expect(authServerApi.oauthExchange).toHaveBeenCalledWith(
        'oauth-exchange-code-xyz'
      )
      expect(result).toEqual({
        success: true,
        data: { authenticated: true },
      })
    })

    it('returns validation failure when token is empty', async () => {
      const result = await oauthExchangeAction({ token: '' })

      expect(result.success).toBe(false)
      expect(authServerApi.oauthExchange).not.toHaveBeenCalled()
    })
  })
})
