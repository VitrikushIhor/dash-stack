import { type NextRequest, NextResponse } from 'next/server'
import { ROUTES } from '@/shared/config'
import { getOAuthFlowCookie } from '@/shared/lib/oauth-flow-cookie'
import { COOKIE_CONFIG, getCookieOptions } from '@/shared/lib/session-cookies'
import { exchangeOAuthCode } from './oauth-code'
import { resolveOAuthRequestConfig } from './oauth-config'
import { completeAccountLink } from './oauth-link-callback'
import { clearFlowCookie } from './oauth-response'
import { OAUTH_LIMITS } from './route-settings/oauth-limits'
import { OAUTH_SESSION_CHANGE } from './route-settings/oauth-session-change'

const STATE_PATTERN = /^[A-Za-z0-9_-]{43}$/
const VERIFIER_PATTERN = /^[A-Za-z0-9_-]{43,128}$/

export async function handleOAuthCallback(
  request: NextRequest
): Promise<NextResponse> {
  const state = request.nextUrl.searchParams.get('state')
  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')
  const config = resolveOAuthRequestConfig(request)
  const failed = NextResponse.redirect(
    new URL(ROUTES.signIn, config?.appUrl ?? request.url)
  )
  failed.headers.set('Cache-Control', 'no-store')

  if (!config) return failed

  if (!state || !STATE_PATTERN.test(state)) {
    return failed
  }

  const cookieName = getOAuthFlowCookie(
    state,
    OAUTH_LIMITS.FLOW_COOKIE_MAX_AGE
  ).name
  const flowValue = request.cookies.get(cookieName)?.value
  if (flowValue?.startsWith('{'))
    return completeAccountLink(
      request,
      flowValue,
      code,
      error,
      cookieName,
      config.appUrl
    )
  const verifier = flowValue
  clearFlowCookie(failed, cookieName)

  if (
    error ||
    !code ||
    code.length > OAUTH_LIMITS.CODE_MAX_LENGTH ||
    !verifier ||
    !VERIFIER_PATTERN.test(verifier)
  ) {
    return failed
  }

  const tokens = await exchangeOAuthCode(
    config.apiUrl,
    code,
    verifier,
    request.headers.get('user-agent') ?? undefined
  )
  if (!tokens) return failed

  const destination = new URL(ROUTES.vocabDecks, config.appUrl)
  destination.searchParams.set(
    OAUTH_SESSION_CHANGE.QUERY_KEY,
    OAUTH_SESSION_CHANGE.QUERY_VALUE
  )
  const response = NextResponse.redirect(destination)
  response.headers.set('Cache-Control', 'no-store')
  clearFlowCookie(response, cookieName)
  response.cookies.set(
    COOKIE_CONFIG.ACCESS_TOKEN.name,
    tokens.accessToken,
    getCookieOptions(COOKIE_CONFIG.ACCESS_TOKEN.maxAge)
  )
  response.cookies.set(
    COOKIE_CONFIG.REFRESH_TOKEN.name,
    tokens.refreshToken,
    getCookieOptions(COOKIE_CONFIG.REFRESH_TOKEN.maxAge)
  )
  return response
}
