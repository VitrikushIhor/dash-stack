import { HTTP_METHODS } from '@/shared/api/http-methods'
import { type SessionTokens, extractSessionTokens } from '@/shared/api/session'
import { OAUTH_LIMITS } from './route-settings/oauth-limits'

export async function exchangeOAuthCode(
  apiUrl: string,
  code: string,
  verifier: string,
  userAgent?: string
): Promise<SessionTokens | null> {
  try {
    const response = await fetch(`${apiUrl}/api/auth/oauth/code`, {
      method: HTTP_METHODS.POST,
      headers: {
        'Content-Type': 'application/json',
        ...(userAgent ? { 'User-Agent': userAgent } : {}),
      },
      body: JSON.stringify({ code, codeVerifier: verifier }),
      cache: 'no-store',
      signal: AbortSignal.timeout(OAUTH_LIMITS.CODE_EXCHANGE_TIMEOUT_MS),
    })

    if (!response.ok) return null
    return extractSessionTokens(response.headers)
  } catch {
    return null
  }
}
