import { cookies } from 'next/headers'

export const AUTH_COOKIE_CONFIG = {
  ACCESS_TOKEN: {
    name: 'access_token',
    maxAge: 60 * 15, // 15 minutes
  },
  REFRESH_TOKEN: {
    name: 'refresh_token',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
} as const

export function getCookieOptions(maxAge: number) {
  const isProduction = process.env.NODE_ENV === 'production'
  const isCookieSecure = process.env.COOKIE_SECURE === 'true' || isProduction

  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isCookieSecure,
    maxAge,
    path: '/',
  }
}

export async function setAuthCookies(tokens: {
  accessToken?: string
  refreshToken?: string
}): Promise<void> {
  const cookieStore = await cookies()

  if (tokens.accessToken) {
    cookieStore.set(
      AUTH_COOKIE_CONFIG.ACCESS_TOKEN.name,
      tokens.accessToken,
      getCookieOptions(AUTH_COOKIE_CONFIG.ACCESS_TOKEN.maxAge)
    )
  }

  if (tokens.refreshToken) {
    cookieStore.set(
      AUTH_COOKIE_CONFIG.REFRESH_TOKEN.name,
      tokens.refreshToken,
      getCookieOptions(AUTH_COOKIE_CONFIG.REFRESH_TOKEN.maxAge)
    )
  }
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_CONFIG.ACCESS_TOKEN.name)
  cookieStore.delete(AUTH_COOKIE_CONFIG.REFRESH_TOKEN.name)
}
