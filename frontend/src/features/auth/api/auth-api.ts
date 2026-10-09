import { type HttpClient } from '@/shared/api'
import type {
  AuthenticatedActionResult,
  SignInInput,
  SignUpInput,
} from '../model/types/auth.types'

export function createAuthApi(client: HttpClient) {
  return {
    login: (data: SignInInput, userAgent?: string) =>
      client.post<AuthenticatedActionResult, SignInInput>('/auth/login', data, {
        headers: userAgent ? { 'User-Agent': userAgent } : undefined,
        skipAuth: true,
      }),

    signup: (data: SignUpInput) =>
      client.post<{ message: string }, SignUpInput>('/auth/signup', data, {
        skipAuth: true,
      }),

    verifyEmail: (token: string) =>
      client.post<AuthenticatedActionResult, { token: string }>(
        '/auth/verify-email',
        { token },
        { skipAuth: true }
      ),

    logout: (refreshToken: string) =>
      client.post<{ message: string }, { refreshToken: string }>(
        '/auth/logout',
        { refreshToken }
      ),

    forgotPassword: (email: string) =>
      client.post<{ message: string }, { email: string }>(
        '/auth/forgot-password',
        { email },
        { skipAuth: true }
      ),

    resetPassword: (data: { token: string; password: string }) =>
      client.post<{ message: string }, { token: string; password: string }>(
        '/auth/reset-password',
        data,
        { skipAuth: true }
      ),

    oauthExchange: (token: string) =>
      client.post<AuthenticatedActionResult, { token: string }>(
        '/auth/oauth/exchange',
        { token },
        { skipAuth: true }
      ),
  }
}
