import type { NextRequest, NextResponse } from 'next/server'
import { handleSessionRequest } from '@/shared/lib/session-middleware'

export function middleware(req: NextRequest): Promise<NextResponse> {
  return handleSessionRequest(req)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
