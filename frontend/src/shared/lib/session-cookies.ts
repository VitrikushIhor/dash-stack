import { cookies } from 'next/headers'
import { COOKIE_CONFIG } from './cookie-config'

export { COOKIE_CONFIG }

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
      COOKIE_CONFIG.ACCESS_TOKEN.name,
      tokens.accessToken,
      getCookieOptions(COOKIE_CONFIG.ACCESS_TOKEN.maxAge)
    )
  }

  if (tokens.refreshToken) {
    cookieStore.set(
      COOKIE_CONFIG.REFRESH_TOKEN.name,
      tokens.refreshToken,
      getCookieOptions(COOKIE_CONFIG.REFRESH_TOKEN.maxAge)
    )
  }
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_CONFIG.ACCESS_TOKEN.name)
  cookieStore.delete(COOKIE_CONFIG.REFRESH_TOKEN.name)
}
