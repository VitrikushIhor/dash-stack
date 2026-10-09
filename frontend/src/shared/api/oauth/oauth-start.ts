import { type NextRequest, NextResponse } from 'next/server'
import { getOAuthFlowCookie } from '@/shared/lib/oauth-flow-cookie'
import { createOAuthAuthorization } from './oauth-authorize'
import { resolveOAuthRequestConfig } from './oauth-config'
import { OAUTH_ERROR_CONFIG } from './route-settings/oauth-error-config'
import { OAUTH_LIMITS } from './route-settings/oauth-limits'

const CONNECTIONS = new Set(['google-oauth2', 'github'])

export function startOAuthLogin(request: NextRequest): NextResponse {
  const connection = request.nextUrl.searchParams.get('connection')
  const config = resolveOAuthRequestConfig(request)
  const domain = config?.auth0Domain
  const clientId = config?.auth0ClientId

  if (
    !connection ||
    !CONNECTIONS.has(connection) ||
    !domain ||
    !/^[a-z0-9.-]+$/i.test(domain) ||
    !clientId ||
    !config
  ) {
    const unavailable = OAUTH_ERROR_CONFIG.UNAVAILABLE
    return new NextResponse(unavailable.message, { status: unavailable.status })
  }

  const authorization = createOAuthAuthorization(
    domain,
    clientId,
    config.appUrl,
    connection
  )
  const response = NextResponse.redirect(authorization.url)
  response.headers.set('Cache-Control', 'no-store')
  const flowCookie = getOAuthFlowCookie(
    authorization.state,
    OAUTH_LIMITS.FLOW_COOKIE_MAX_AGE
  )
  response.cookies.set(
    flowCookie.name,
    authorization.verifier,
    flowCookie.options
  )
  return response
}
