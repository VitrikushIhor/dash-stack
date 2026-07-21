import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000'

async function handleProxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  const targetPath = resolvedParams.path.join('/')
  const search = req.nextUrl.search

  const cookieStore = await cookies()
  let accessToken = cookieStore.get('access_token')?.value
  const refreshToken = cookieStore.get('refresh_token')?.value

  const headers = new Headers(req.headers)
  headers.delete('host')
  headers.delete('connection')

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  let body: BodyInit | null = null
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    body = await req.arrayBuffer()
  }

  let backendRes = await fetch(`${API_BASE_URL}/api/${targetPath}${search}`, {
    method: req.method,
    headers,
    body,
  })

  // Handle 401 - Token refresh attempt
  if (backendRes.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshToken }),
    })

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json()
      accessToken = refreshData.accessToken

      // Update cookie
      cookieStore.set('access_token', accessToken!, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15,
        path: '/',
      })

      headers.set('Authorization', `Bearer ${accessToken}`)
      backendRes = await fetch(`${API_BASE_URL}/api/${targetPath}${search}`, {
        method: req.method,
        headers,
        body,
      })
    } else {
      cookieStore.delete('access_token')
      cookieStore.delete('refresh_token')
    }
  }

  const resHeaders = new Headers(backendRes.headers)
  resHeaders.delete('transfer-encoding')

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    statusText: backendRes.statusText,
    headers: resHeaders,
  })
}

export {
  handleProxy as GET,
  handleProxy as POST,
  handleProxy as PUT,
  handleProxy as PATCH,
  handleProxy as DELETE,
}
