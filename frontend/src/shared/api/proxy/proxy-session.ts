import type { NextRequest } from 'next/server'
import { SESSION_REFRESH_STATUS, refreshSession } from '@/shared/api/session'
import { COOKIE_CONFIG, getCookieOptions } from '@/shared/lib/session-cookies'
import { PROXY_ERROR_CONFIG } from './errors/proxy-error-config'
import { proxyErrorResponse } from './errors/proxy-errors'
import { sendUpstreamRequest } from './proxy-upstream'
import type {
  PendingCookie,
  ProxyRequestContext,
  ProxySessionResult,
} from './proxy.types'

export async function handleUnauthorizedResponse(
  req: NextRequest,
  context: ProxyRequestContext,
  response: Response
): Promise<ProxySessionResult> {
  const cookiesToSet: PendingCookie[] = []
  const cookiesToDelete: string[] = []

  if (response.status !== 401) {
    return { response, cookiesToSet, cookiesToDelete }
  }

  if (!context.refreshToken) {
    cookiesToDelete.push(COOKIE_CONFIG.ACCESS_TOKEN.name)
    return { response, cookiesToSet, cookiesToDelete }
  }

  const refreshOutcome = await refreshSession(
    context.refreshToken,
    context.requestId
  )

  switch (refreshOutcome.status) {
    case SESSION_REFRESH_STATUS.SUCCESS: {
      const { tokens } = refreshOutcome

      cookiesToSet.push(
        {
          name: COOKIE_CONFIG.ACCESS_TOKEN.name,
          value: tokens.accessToken,
          options: getCookieOptions(COOKIE_CONFIG.ACCESS_TOKEN.maxAge),
        },
        {
          name: COOKIE_CONFIG.REFRESH_TOKEN.name,
          value: tokens.refreshToken,
          options: getCookieOptions(COOKIE_CONFIG.REFRESH_TOKEN.maxAge),
        }
      )

      const retryContext: ProxyRequestContext = {
        ...context,
        headers: {
          ...context.headers,
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }

      try {
        const retryResponse = await sendUpstreamRequest(req, retryContext)
        return { response: retryResponse, cookiesToSet, cookiesToDelete }
      } catch {
        return {
          response: proxyErrorResponse(
            PROXY_ERROR_CONFIG.UPSTREAM_UNAVAILABLE_RETRY
          ),
          cookiesToSet,
          cookiesToDelete,
        }
      }
    }

    case SESSION_REFRESH_STATUS.INVALID_SESSION:
      cookiesToDelete.push(
        COOKIE_CONFIG.ACCESS_TOKEN.name,
        COOKIE_CONFIG.REFRESH_TOKEN.name
      )
      return { response, cookiesToSet, cookiesToDelete }

    case SESSION_REFRESH_STATUS.INVALID_RESPONSE:
      cookiesToDelete.push(
        COOKIE_CONFIG.ACCESS_TOKEN.name,
        COOKIE_CONFIG.REFRESH_TOKEN.name
      )
      return {
        response: proxyErrorResponse(
          PROXY_ERROR_CONFIG.INVALID_REFRESH_RESPONSE
        ),
        cookiesToSet,
        cookiesToDelete,
      }

    case SESSION_REFRESH_STATUS.UNAVAILABLE:
      return {
        response: proxyErrorResponse(
          PROXY_ERROR_CONFIG.SESSION_REFRESH_UNAVAILABLE
        ),
        cookiesToSet,
        cookiesToDelete,
      }

    default: {
      const unexpectedOutcome: never = refreshOutcome
      void unexpectedOutcome
      throw new Error('Unexpected session refresh outcome')
    }
  }
}
