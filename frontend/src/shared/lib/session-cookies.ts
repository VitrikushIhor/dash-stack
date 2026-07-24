import { cookies } from 'next/headers'

export const AUTH_COOKIE_CONFIG = {
  ACCESS_TOKEN: {
    name: 'access_token',
    maxAge: 60 * 15, // 15 minutes
  },
  REFRESH_TOKEN: {
    name: 'refresh_token',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
} as const

export async function setAuthCookies(tokens: {
  accessToken?: string
  refreshToken?: string
}): Promise<void> {
  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === 'production'

  if (tokens.accessToken) {
    cookieStore.set(AUTH_COOKIE_CONFIG.ACCESS_TOKEN.name, tokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: AUTH_COOKIE_CONFIG.ACCESS_TOKEN.maxAge,
      path: '/',
    })
  }

  if (tokens.refreshToken) {
    cookieStore.set(
      AUTH_COOKIE_CONFIG.REFRESH_TOKEN.name,
      tokens.refreshToken,
      {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        maxAge: AUTH_COOKIE_CONFIG.REFRESH_TOKEN.maxAge,
        path: '/',
      }
    )
  }
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_CONFIG.ACCESS_TOKEN.name)
  cookieStore.delete(AUTH_COOKIE_CONFIG.REFRESH_TOKEN.name)
}
