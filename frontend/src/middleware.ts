import { type NextRequest, NextResponse } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard',
  '/task',
  '/calendar',
  '/settings',
  '/organizations',
  '/invite',
  '/create-organization',
]

export function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value
  const pathname = req.nextUrl.pathname
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))

  if (isProtected && !token) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
