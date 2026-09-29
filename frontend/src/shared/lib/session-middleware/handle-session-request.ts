import { type NextRequest, NextResponse } from 'next/server'
import { SESSION_REFRESH_STATUS, refreshSession } from '@/shared/api/session'
import {
  SESSION_UNAVAILABLE_PATH,
  isAuthPath,
  isProtectedPath,
} from '@/shared/config/route-access'
import { COOKIE_CONFIG } from '@/shared/lib/cookie-config'
import { hasUnexpiredAccessToken } from './access-token'
import {
  clearAuthCookies,
  continueWithTokens,
  protectCredentialPage,
  redirectToSessionUnavailable,
  redirectToSignIn,
} from './session-response'

export async function handleSessionRequest(
  req: NextRequest
): Promise<NextResponse> {
  const accessToken = req.cookies.get(COOKIE_CONFIG.ACCESS_TOKEN.name)?.value
  const refreshToken = req.cookies.get(COOKIE_CONFIG.REFRESH_TOKEN.name)?.value
  const hasRecoverableSession = Boolean(accessToken || refreshToken)
  const hasUsableAccess = hasUnexpiredAccessToken(accessToken)
  const pathname = req.nextUrl.pathname

  const isProtected = isProtectedPath(pathname)
  const isAuthPage = isAuthPath(pathname)

  if (isProtected && !hasRecoverableSession) {
    return protectCredentialPage(pathname, redirectToSignIn(req))
  }

  if (
    isAuthPage ||
    pathname === SESSION_UNAVAILABLE_PATH ||
    hasUsableAccess ||
    !refreshToken
  ) {
    return protectCredentialPage(pathname, NextResponse.next())
  }

  const outcome = await refreshSession(refreshToken)

  if (outcome.status === SESSION_REFRESH_STATUS.SUCCESS) {
    return protectCredentialPage(
      pathname,
      continueWithTokens(req, outcome.tokens)
    )
  }

  if (outcome.status === SESSION_REFRESH_STATUS.INVALID_SESSION) {
    const response = isProtected ? redirectToSignIn(req) : NextResponse.next()

    return protectCredentialPage(pathname, clearAuthCookies(response))
  }

  if (isProtected) {
    return redirectToSessionUnavailable(req)
  }

  return protectCredentialPage(pathname, NextResponse.next())
}
