import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

const BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:8000'

async function forward(req: NextRequest, path: string[]) {
  const store = await cookies()
  const token = store.get('access_token')?.value
  const refreshToken = store.get('refresh_token')?.value
  const search = req.nextUrl.search

  const headers: Record<string, string> = {
    'Content-Type': req.headers.get('content-type') ?? 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const body = ['GET', 'HEAD'].includes(req.method)
    ? undefined
    : await req.text()

  let res = await fetch(`${BASE_URL}/api/${path.join('/')}${search}`, {
    method: req.method,
    headers,
    body,
  })

  // Handle 401 - Token refresh attempt
  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshToken }),
    })

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json()
      const newAccessToken = refreshData.accessToken
      if (newAccessToken) {
        store.set('access_token', newAccessToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 15,
          path: '/',
        })
        headers['Authorization'] = `Bearer ${newAccessToken}`
        res = await fetch(`${BASE_URL}/api/${path.join('/')}${search}`, {
          method: req.method,
          headers,
          body,
        })
      }
    } else {
      store.delete('access_token')
      store.delete('refresh_token')
    }
  }

  const resHeaders = new Headers()
  resHeaders.set(
    'Content-Type',
    res.headers.get('content-type') ?? 'application/json'
  )

  const setCookie = res.headers.get('set-cookie')
  if (setCookie) {
    resHeaders.set('set-cookie', setCookie)
  }

  const data = await res.text()
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
