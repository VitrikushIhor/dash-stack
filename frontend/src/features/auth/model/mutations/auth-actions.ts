'use server'

import { cookies } from 'next/headers'
import { serverApi } from '@/shared/api/server-api-client'
import {
  setAuthCookies,
  clearAuthCookies,
  AUTH_COOKIE_CONFIG,
} from '@/shared/lib/session-cookies'
import type { AuthTokens, SignInInput, SignUpInput } from '../types/auth.types'

export async function signInAction(input: SignInInput): Promise<AuthTokens> {
  const tokens = await serverApi.post<AuthTokens, SignInInput>(
    '/auth/login',
    input,
    { skipAuth: true }
  )
  await setAuthCookies(tokens)
  return tokens
}

export async function signUpAction(
  input: SignUpInput
): Promise<{ message: string }> {
  return serverApi.post<{ message: string }, SignUpInput>(
    '/auth/signup',
    input,
    { skipAuth: true }
  )
}

export async function verifyEmailAction(token: string): Promise<AuthTokens> {
  const tokens = await serverApi.post<AuthTokens, { token: string }>(
    '/auth/verify-email',
    { token },
    { skipAuth: true }
  )
  await setAuthCookies(tokens)
  return tokens
}

export async function logoutAction(): Promise<{ message: string }> {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(
    AUTH_COOKIE_CONFIG.REFRESH_TOKEN.name
  )?.value

  if (refreshToken) {
    try {
      await serverApi.post<{ message: string }, { refreshToken: string }>(
        '/auth/logout',
        { refreshToken }
      )
    } catch {
      // Ignore network/server errors during logout and proceed to clear cookies
    }
  }

  await clearAuthCookies()
  return { message: 'Logged out successfully' }
}

export async function forgotPasswordAction(
  email: string
): Promise<{ message: string }> {
  return serverApi.post<{ message: string }, { email: string }>(
    '/auth/forgot-password',
    { email },
    { skipAuth: true }
  )
}

export async function resetPasswordAction(
  token: string,
  password: string
): Promise<{ message: string }> {
  return serverApi.post<
    { message: string },
    { token: string; password: string }
  >('/auth/reset-password', { token, password }, { skipAuth: true })
}

export async function oauthExchangeAction(token: string): Promise<AuthTokens> {
  const tokens = await serverApi.post<AuthTokens, { token: string }>(
    '/auth/oauth/exchange',
    { token },
    { skipAuth: true }
  )
  await setAuthCookies(tokens)
  return tokens
}
