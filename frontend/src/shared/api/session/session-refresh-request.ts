import { HTTP_METHODS } from '@/shared/api/http-methods'
import { env } from '@/shared/config/env'
import { SESSION_REFRESH_STATUS } from './session-refresh-status'
import type { SessionRefreshOutcome } from './session-refresh.types'
import { extractSessionTokens } from './session-token-cookies'

const BASE_URL = env.API_URL ?? 'http://localhost:8000'
const REFRESH_TIMEOUT_MS = 30_000

export async function requestSessionRefresh(
  refreshToken: string,
  requestId?: string
): Promise<SessionRefreshOutcome> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: HTTP_METHODS.POST,
      headers: {
        'Content-Type': 'application/json',
        ...(requestId ? { 'X-Request-Id': requestId } : {}),
      },
      body: JSON.stringify({ token: refreshToken }),
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
    })

    if (response.status === 401 || response.status === 403) {
      return { status: SESSION_REFRESH_STATUS.INVALID_SESSION }
    }

    if (!response.ok) {
      return { status: SESSION_REFRESH_STATUS.UNAVAILABLE }
    }

    const tokens = extractSessionTokens(response.headers)

    return tokens
      ? { status: SESSION_REFRESH_STATUS.SUCCESS, tokens }
      : { status: SESSION_REFRESH_STATUS.INVALID_RESPONSE }
  } catch {
    return { status: SESSION_REFRESH_STATUS.UNAVAILABLE }
  }
}
