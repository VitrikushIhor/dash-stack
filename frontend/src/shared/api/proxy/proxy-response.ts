import { NextResponse } from 'next/server'
import { COOKIE_CONFIG } from '@/shared/lib/session-cookies'
import type { PendingCookie } from './proxy.types'

const AUTH_COOKIE_NAMES = new Set<string>([
  COOKIE_CONFIG.ACCESS_TOKEN.name,
  COOKIE_CONFIG.REFRESH_TOKEN.name,
])

export async function buildProxyResponse(
  res: Response,
  requestId: string,
  cookiesToSet: PendingCookie[],
  cookiesToDelete: string[]
): Promise<NextResponse> {
  const resHeaders = new Headers()
  const resContentType = res.headers.get('content-type')

  if (resContentType) {
    resHeaders.set('Content-Type', resContentType)
  }

  const resContentDisposition = res.headers.get('content-disposition')

  if (resContentDisposition) {
    resHeaders.set('Content-Disposition', resContentDisposition)
  }

  resHeaders.set('Cache-Control', 'no-store')
  resHeaders.set('X-Request-Id', requestId)
  resHeaders.set('X-Content-Type-Options', 'nosniff')

  // Forward non-auth upstream Set-Cookie headers individually.
  // Auth cookies are exclusively owned by this proxy layer.
  for (const cookie of res.headers.getSetCookie()) {
    const cookieName = cookie.split('=', 1)[0]

    if (!AUTH_COOKIE_NAMES.has(cookieName)) {
      resHeaders.append('set-cookie', cookie)
    }
  }

  const data = res.status === 204 ? null : await res.arrayBuffer()
  const response = new NextResponse(data, {
    status: res.status,
    headers: resHeaders,
  })

  // Apply pending cookie operations explicitly on the response
  for (const pending of cookiesToSet) {
    response.cookies.set(pending.name, pending.value, pending.options)
  }
  for (const name of cookiesToDelete) {
    response.cookies.delete(name)
  }

  return response
}
