import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { COOKIE_CONFIG, getCookieOptions } from '@/shared/lib/session-cookies'

const BASE_URL = process.env.API_URL ?? 'http://localhost:8000'

if (!process.env.API_URL && process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.warn(
    'API_URL is missing in production. Defaulting to http://localhost:8000'
  )
}

const UPSTREAM_TIMEOUT_MS = 30_000

const AUTH_COOKIE_NAMES = new Set<string>([
  COOKIE_CONFIG.ACCESS_TOKEN.name,
  COOKIE_CONFIG.REFRESH_TOKEN.name,
])

function jsonResponse(
  body: Record<string, unknown>,
  status: number
): NextResponse {
  return NextResponse.json(body, { status })
}

interface PendingCookie {
  name: string
  value: string
  options: ReturnType<typeof getCookieOptions>
}

interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidRefreshResponse(data: unknown): data is RefreshResponse {
  if (typeof data !== 'object' || data === null) {
    return false
  }
  const value = data as Record<string, unknown>
  return (
    isNonEmptyString(value.accessToken) && isNonEmptyString(value.refreshToken)
  )
}

async function fetchUpstream(
  url: string,
  init: RequestInit,
  requestSignal?: AbortSignal
): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
  return fetch(url, {
    ...init,
    signal: requestSignal
      ? AbortSignal.any([requestSignal, timeoutSignal])
      : timeoutSignal,
  })
}

function buildUpstreamUrl(path: string[], search: string): string {
  return `${BASE_URL}/api/${path.join('/')}${search}`
}

function isTraversalPath(path: string[]): boolean {
  return path.some((segment) => segment === '..' || segment.includes('\\'))
}

async function forward(req: NextRequest, path: string[]) {
  if (isTraversalPath(path)) {
    return NextResponse.json(
      { code: 'INVALID_PATH', message: 'Invalid path' },
      { status: 400 }
    )
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_CONFIG.ACCESS_TOKEN.name)?.value
  const refreshToken = cookieStore.get(COOKIE_CONFIG.REFRESH_TOKEN.name)?.value
  const search = req.nextUrl.search

  const contentType = req.headers.get('content-type')
  const accept = req.headers.get('accept')
  const headers: Record<string, string> = {
    ...(contentType && { 'Content-Type': contentType }),
    Accept: accept ?? 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  let body: ArrayBuffer | undefined = undefined
  if (!['GET', 'HEAD'].includes(req.method)) {
    const buffer = await req.arrayBuffer()
    if (buffer.byteLength > 0) {
      body = buffer
    }
  }

  let res: Response
  try {
    res = await fetchUpstream(
      buildUpstreamUrl(path, search),
      {
        method: req.method,
        headers,
        body,
      },
      req.signal
    )
  } catch {
    return jsonResponse(
      {
        code: 'UPSTREAM_UNAVAILABLE',
        message: 'Backend temporarily unavailable',
      },
      502
    )
  }

  const cookiesToSet: PendingCookie[] = []
  const cookiesToDelete: string[] = []

  // Known limitation: concurrent refresh is not deduplicated yet.
  // Parallel 401 responses can trigger multiple refresh requests.
  // Post-SSR task: add refresh deduplication/mutex.
  if (res.status === 401) {
    if (refreshToken) {
      try {
        const refreshRes = await fetchUpstream(
          buildUpstreamUrl(['auth', 'refresh'], ''),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: refreshToken }),
          },
          req.signal
        )

        if (refreshRes.ok) {
          let refreshData: unknown
          try {
            refreshData = await refreshRes.json()
          } catch {
            cookiesToDelete.push(
              COOKIE_CONFIG.ACCESS_TOKEN.name,
              COOKIE_CONFIG.REFRESH_TOKEN.name
            )
            res = jsonResponse(
              {
                code: 'INVALID_REFRESH_RESPONSE',
                message: 'Invalid refresh response',
              },
              502
            )
            refreshData = null
          }

          if (refreshData !== null) {
            if (!isValidRefreshResponse(refreshData)) {
              cookiesToDelete.push(
                COOKIE_CONFIG.ACCESS_TOKEN.name,
                COOKIE_CONFIG.REFRESH_TOKEN.name
              )
              res = jsonResponse(
                {
                  code: 'INVALID_REFRESH_RESPONSE',
                  message: 'Invalid refresh response',
                },
                502
              )
            } else {
              cookiesToSet.push({
                name: COOKIE_CONFIG.ACCESS_TOKEN.name,
                value: refreshData.accessToken,
                options: getCookieOptions(COOKIE_CONFIG.ACCESS_TOKEN.maxAge),
              })
              cookiesToSet.push({
                name: COOKIE_CONFIG.REFRESH_TOKEN.name,
                value: refreshData.refreshToken,
                options: getCookieOptions(COOKIE_CONFIG.REFRESH_TOKEN.maxAge),
              })

              headers['Authorization'] = `Bearer ${refreshData.accessToken}`

              try {
                res = await fetchUpstream(
                  buildUpstreamUrl(path, search),
                  {
                    method: req.method,
                    headers,
                    body,
                  },
                  req.signal
                )
              } catch {
                res = jsonResponse(
                  {
                    code: 'UPSTREAM_UNAVAILABLE',
                    message: 'Backend temporarily unavailable during retry',
                  },
                  502
                )
              }
            }
          }
        } else if (refreshRes.status === 401 || refreshRes.status === 403) {
          // Invalid or revoked session → clear auth cookies
          cookiesToDelete.push(
            COOKIE_CONFIG.ACCESS_TOKEN.name,
            COOKIE_CONFIG.REFRESH_TOKEN.name
          )
        }
        // For transient errors (500), preserve cookies
        // and let the original 401 pass through to the client
      } catch {
        // Refresh network error (timeout, DNS, etc.) → preserve cookies,
        // return original 401
      }
    } else {
      cookiesToDelete.push(COOKIE_CONFIG.ACCESS_TOKEN.name)
    }
  }

  const resHeaders = new Headers()
  const resContentType = res.headers.get('content-type')
  if (resContentType) {
    resHeaders.set('Content-Type', resContentType)
  }
  resHeaders.set('Cache-Control', 'no-store')

  // Forward non-auth upstream Set-Cookie headers individually.
  // Auth cookies are exclusively owned by this proxy layer.
  for (const cookie of res.headers.getSetCookie()) {
    const cookieName = cookie.split('=', 1)[0]
    if (!AUTH_COOKIE_NAMES.has(cookieName)) {
      resHeaders.append('set-cookie', cookie)
    }
  }

  const data = await res.arrayBuffer()
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

async function handle(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path = [] } = await params
  return forward(req, path)
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
export const HEAD = handle
