import { type NextRequest, NextResponse } from 'next/server'
import { isTrustedMutation, readBoundedBody } from '@/shared/api/proxy'
import { ROUTES } from '@/shared/config'
import { getOAuthFlowCookie } from '@/shared/lib/oauth-flow-cookie'
import { COOKIE_CONFIG } from '@/shared/lib/session-cookies'
import { createOAuthAuthorization } from './oauth-authorize'
import { resolveOAuthRequestConfig } from './oauth-config'
import { OAUTH_LINK_CONNECTIONS, sessionBinding } from './oauth-link-flow'
import { OAUTH_ERROR_CONFIG } from './route-settings/oauth-error-config'
import { OAUTH_LIMITS } from './route-settings/oauth-limits'
import { OAUTH_LINK_CONFIG } from './route-settings/oauth-link-config'

export async function startOAuthAccountLink(
  request: NextRequest
): Promise<NextResponse> {
  if (!isTrustedMutation(request))
    return linkingError(OAUTH_ERROR_CONFIG.CSRF_FORBIDDEN)
  const credential = request.cookies.get(
    COOKIE_CONFIG.REFRESH_TOKEN.name
  )?.value
  if (!credential)
    return NextResponse.redirect(
      new URL(ROUTES.signIn, request.url),
      OAUTH_LINK_CONFIG.REDIRECT_STATUS
    )
  let body: ArrayBuffer | null
  try {
    body = await readBoundedBody(
      request,
      OAUTH_LIMITS.LINK_START_BODY_MAX_BYTES
    )
  } catch {
    return linkingError(OAUTH_ERROR_CONFIG.INVALID_REQUEST)
  }
  if (body === null) return linkingError(OAUTH_ERROR_CONFIG.PAYLOAD_TOO_LARGE)
  const form = new URLSearchParams(new TextDecoder().decode(body))
  const connection = form.get('connection')
  if (connection !== 'google-oauth2' && connection !== 'github')
    return linkingError(OAUTH_ERROR_CONFIG.INVALID_REQUEST)
  const config = resolveOAuthRequestConfig(request)
  if (!config?.auth0Domain || !config.auth0ClientId) {
    return new NextResponse(OAUTH_ERROR_CONFIG.UNAVAILABLE.message, {
      status: OAUTH_ERROR_CONFIG.UNAVAILABLE.status,
    })
  }
  const authorization = createOAuthAuthorization(
    config.auth0Domain,
    config.auth0ClientId,
    config.appUrl,
    connection
  )
  authorization.url.searchParams.set('prompt', 'login')
  const returnTo =
    form.get('returnTo') === ROUTES.settingsAccounts
      ? ROUTES.settingsAccounts
      : ROUTES.vocabSettingsAccounts
  const cookie = getOAuthFlowCookie(
    authorization.state,
    OAUTH_LIMITS.FLOW_COOKIE_MAX_AGE
  )
  const response = NextResponse.redirect(
    authorization.url,
    OAUTH_LINK_CONFIG.REDIRECT_STATUS
  )
  response.headers.set('Cache-Control', 'no-store')
  response.cookies.set(
    cookie.name,
    JSON.stringify({
      verifier: authorization.verifier,
      sessionHash: sessionBinding(credential),
      provider: OAUTH_LINK_CONNECTIONS[connection],
      returnTo,
    }),
    cookie.options
  )
  return response
}

function linkingError(error: {
  message: string
  status: number
}): NextResponse {
  return new NextResponse(error.message, {
    status: error.status,
    headers: { 'Cache-Control': 'no-store' },
  })
}
