import { NextRequest, NextResponse } from 'next/server'
import { HTTP_METHODS } from '@/shared/api/http-methods'
import { forwardProxyRequest } from '@/shared/api/proxy'
import { ROUTES } from '@/shared/config'
import { COOKIE_CONFIG } from '@/shared/lib/session-cookies'
import { oauthLinkFlowSchema, sessionBinding } from './oauth-link-flow'
import { clearFlowCookie } from './oauth-response'
import { OAUTH_LIMITS } from './route-settings/oauth-limits'
import {
  OAUTH_LINK_CONFIG,
  OAUTH_LINK_RESULT,
} from './route-settings/oauth-link-config'

export async function completeAccountLink(
  request: NextRequest,
  value: string,
  code: string | null,
  providerError: string | null,
  cookieName: string,
  appUrl: URL
): Promise<NextResponse> {
  let raw: unknown
  try {
    raw = JSON.parse(value)
  } catch {
    raw = null
  }
  const parsed = oauthLinkFlowSchema.safeParse(raw)
  const destination = new URL(
    parsed.success ? parsed.data.returnTo : ROUTES.vocabSettingsAccounts,
    appUrl
  )
  destination.searchParams.set(
    OAUTH_LINK_CONFIG.RESULT_QUERY_KEY,
    OAUTH_LINK_RESULT.FAILED
  )
  const response = NextResponse.redirect(destination)
  response.headers.set('Cache-Control', 'no-store')
  clearFlowCookie(response, cookieName)
  const credential = request.cookies.get(
    COOKIE_CONFIG.REFRESH_TOKEN.name
  )?.value
  if (
    !parsed.success ||
    providerError ||
    !code ||
    code.length > OAUTH_LIMITS.CODE_MAX_LENGTH ||
    !credential ||
    sessionBinding(credential) !== parsed.data.sessionHash
  )
    return response

  const upstream = await forwardProxyRequest(
    new NextRequest(new URL('/api/proxy/auth/oauth/link-code', appUrl), {
      method: HTTP_METHODS.POST,
      headers: {
        origin: appUrl.origin,
        'sec-fetch-site': 'same-origin',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        code,
        codeVerifier: parsed.data.verifier,
        provider: parsed.data.provider,
      }),
    }),
    ['auth', 'oauth', 'link-code']
  )
  for (const cookie of upstream.headers.getSetCookie())
    response.headers.append('set-cookie', cookie)
  if (upstream.ok) {
    destination.searchParams.set(
      OAUTH_LINK_CONFIG.RESULT_QUERY_KEY,
      OAUTH_LINK_RESULT.SUCCESS
    )
    response.headers.set('Location', destination.toString())
  }
  return response
}
