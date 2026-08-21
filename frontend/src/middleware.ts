import { type NextRequest, NextResponse } from 'next/server'
import { ROUTES } from '@/shared/config'

const PROTECTED_PATHS = [
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

export function isSafeRedirectPath(path: string | null | undefined): boolean {
  if (!path || typeof path !== 'string') return false
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.startsWith('/\\')
  ) {
    return false
  }
  if (
    path.includes('\\') ||
    path.toLowerCase().includes('javascript:') ||
    path.toLowerCase().includes('data:')
  ) {
    return false
  }
  return true
}

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
    const targetUrl = req.nextUrl.pathname + req.nextUrl.search
    signInUrl.searchParams.set('redirect', targetUrl)
    return NextResponse.redirect(signInUrl)
  }

  if (isAuthPage && isAuthenticated) {
    const redirectParam = req.nextUrl.searchParams.get('redirect')
    const targetPath = isSafeRedirectPath(redirectParam)
      ? redirectParam!
      : ROUTES.organizations
    return NextResponse.redirect(new URL(targetPath, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
