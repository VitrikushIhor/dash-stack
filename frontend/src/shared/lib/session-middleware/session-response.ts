import { type NextRequest, NextResponse } from 'next/server'
import type { SessionTokens } from '@/shared/api/session'
import { ROUTES } from '@/shared/config'
import {
  SESSION_UNAVAILABLE_PATH,
  isCredentialPath,
} from '@/shared/config/route-access'
import { COOKIE_CONFIG, getCookieOptions } from '@/shared/lib/session-cookies'

export function redirectToSignIn(req: NextRequest): NextResponse {
  const signInUrl = new URL(ROUTES.signIn, req.url)
  const targetUrl = req.nextUrl.pathname + req.nextUrl.search

  signInUrl.searchParams.set('redirect', targetUrl)

  return NextResponse.redirect(signInUrl)
}

export function continueWithTokens(
  req: NextRequest,
  tokens: SessionTokens
): NextResponse {
  const requestHeaders = new Headers(req.headers)
  const requestCookies = new Map(
    req.cookies.getAll().map(({ name, value }) => [name, value])
  )

  requestCookies.set(COOKIE_CONFIG.ACCESS_TOKEN.name, tokens.accessToken)
  requestCookies.set(COOKIE_CONFIG.REFRESH_TOKEN.name, tokens.refreshToken)
  requestHeaders.set(
    'cookie',
    [...requestCookies].map(([name, value]) => `${name}=${value}`).join('; ')
  )

  const response = NextResponse.next({ request: { headers: requestHeaders } })

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

export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete(COOKIE_CONFIG.ACCESS_TOKEN.name)
  response.cookies.delete(COOKIE_CONFIG.REFRESH_TOKEN.name)

  return response
}

export function redirectToSessionUnavailable(req: NextRequest): NextResponse {
  const unavailableUrl = new URL(SESSION_UNAVAILABLE_PATH, req.url)

  unavailableUrl.searchParams.set(
    'returnTo',
    req.nextUrl.pathname + req.nextUrl.search
  )

  return NextResponse.redirect(unavailableUrl)
}

export function protectCredentialPage(
  pathname: string,
  response: NextResponse
): NextResponse {
  if (isCredentialPath(pathname)) {
    response.headers.set('Referrer-Policy', 'no-referrer')
  }

  return response
}
