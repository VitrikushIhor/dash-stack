import { COOKIE_CONFIG } from '@/shared/lib/cookie-config'
import type { SessionTokens } from './session-refresh.types'

export function extractSessionTokens(headers: Headers): SessionTokens | null {
  const values = new Map<string, string>()

  for (const header of headers.getSetCookie()) {
    const [cookiePair] = header.split(';', 1)
    const separatorIndex = cookiePair.indexOf('=')

    if (separatorIndex <= 0) continue

    const name = cookiePair.slice(0, separatorIndex)
    const value = cookiePair.slice(separatorIndex + 1)

    values.set(name, value)
  }

  const accessToken = values.get(COOKIE_CONFIG.ACCESS_TOKEN.name)
  const refreshToken = values.get(COOKIE_CONFIG.REFRESH_TOKEN.name)

  return accessToken && refreshToken ? { accessToken, refreshToken } : null
}
