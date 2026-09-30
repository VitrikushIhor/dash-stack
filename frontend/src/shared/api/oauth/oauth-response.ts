import type { NextResponse } from 'next/server'
import { getOAuthFlowCookie } from '@/shared/lib/oauth-flow-cookie'

export function clearFlowCookie(
  response: NextResponse,
  cookieName: string
): void {
  response.cookies.set(cookieName, '', getOAuthFlowCookie('', 0).options)
}
