import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { accessToken, refreshToken } = await req.json()
    const cookieStore = await cookies()

    if (accessToken) {
      cookieStore.set('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15, // 15 min
        path: '/',
      })
    }

    if (refreshToken) {
      cookieStore.set('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })
    }

    return NextResponse.json({ ok: true })
  } catch (_err) {
    return NextResponse.json({ error: 'Failed to set tokens' }, { status: 400 })
  }
}
