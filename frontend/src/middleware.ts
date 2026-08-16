import { type NextRequest, NextResponse } from 'next/server'
import { ROUTES } from '@/shared/config/constants/routes'

const PROTECTED_PATHS = [
  ROUTES.task,
  ROUTES.calendar,
  ROUTES.settings,
  ROUTES.organizations,
  ROUTES.acceptInvite,
  ROUTES.createOrganization,
]

const AUTH_PATHS = [
  ROUTES.signIn,
  ROUTES.signUp,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
]

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get('access_token')?.value
  const refreshToken = req.cookies.get('refresh_token')?.value
  const isAuthenticated = Boolean(accessToken || refreshToken)
  const pathname = req.nextUrl.pathname

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
  const isAuthPage = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  if (isProtected && !isAuthenticated) {
    const signInUrl = new URL(ROUTES.signIn, req.url)
    signInUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signInUrl)
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.organizations, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
