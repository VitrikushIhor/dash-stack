import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { COOKIE_CONFIG, getCookieOptions } from '@/shared/lib/session-cookies'

const BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:8000'

async function forward(req: NextRequest, path: string[]) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_CONFIG.ACCESS_TOKEN.name)?.value
  const refreshToken = cookieStore.get(COOKIE_CONFIG.REFRESH_TOKEN.name)?.value
  const search = req.nextUrl.search

  const contentType = req.headers.get('content-type')
  const headers: Record<string, string> = {
    ...(contentType && { 'Content-Type': contentType }),
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  let body: ArrayBuffer | undefined = undefined
  if (!['GET', 'HEAD'].includes(req.method)) {
    const buffer = await req.arrayBuffer()
    if (buffer.byteLength > 0) {
      body = buffer
    }
  }

  let res = await fetch(`${BASE_URL}/api/${path.join('/')}${search}`, {
    method: req.method,
    headers,
    body,
  })

  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshToken }),
    })

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json()
      const newAccessToken = refreshData.accessToken
      const newRefreshToken = refreshData.refreshToken
      if (newAccessToken) {
        cookieStore.set(
          COOKIE_CONFIG.ACCESS_TOKEN.name,
          newAccessToken,
          getCookieOptions(COOKIE_CONFIG.ACCESS_TOKEN.maxAge)
        )
        if (newRefreshToken) {
          cookieStore.set(
            COOKIE_CONFIG.REFRESH_TOKEN.name,
            newRefreshToken,
            getCookieOptions(COOKIE_CONFIG.REFRESH_TOKEN.maxAge)
          )
        }
        headers['Authorization'] = `Bearer ${newAccessToken}`
        res = await fetch(`${BASE_URL}/api/${path.join('/')}${search}`, {
          method: req.method,
          headers,
          body,
        })
      }
    } else {
      cookieStore.delete(COOKIE_CONFIG.ACCESS_TOKEN.name)
      cookieStore.delete(COOKIE_CONFIG.REFRESH_TOKEN.name)
    }
  }

  const resHeaders = new Headers()
  const resContentType = res.headers.get('content-type')
  if (resContentType) {
    resHeaders.set('Content-Type', resContentType)
  }

  const setCookie = res.headers.get('set-cookie')
  if (setCookie) {
    resHeaders.set('set-cookie', setCookie)
  }

  const data = await res.arrayBuffer()
  return new NextResponse(data, {
    status: res.status,
    headers: resHeaders,
  })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return forward(req, (await params).path)
}
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return forward(req, (await params).path)
}
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return forward(req, (await params).path)
}
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return forward(req, (await params).path)
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return forward(req, (await params).path)
}
