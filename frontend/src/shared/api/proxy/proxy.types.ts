import type { NextResponse } from 'next/server'
import type { getCookieOptions } from '@/shared/lib/session-cookies'
import type { PROXY_ERROR_CODES } from './errors/proxy-error-codes'

export interface PendingCookie {
  name: string
  value: string
  options: ReturnType<typeof getCookieOptions>
}

export interface ProxyRouteContext {
  params: Promise<{ path: string[] }>
}

export type ProxyErrorCode =
  (typeof PROXY_ERROR_CODES)[keyof typeof PROXY_ERROR_CODES]

export interface ProxyError {
  status: number
  code: ProxyErrorCode
  message: string
}

export interface ProxyRequestContext {
  normalizedPath: string[]
  search: string
  requestId: string
  refreshToken?: string
  headers: Record<string, string>
  body?: ArrayBuffer
}

export type ProxyRequestPreparation =
  | { ok: true; context: ProxyRequestContext }
  | { ok: false; response: NextResponse }

export interface ProxySessionResult {
  response: Response
  cookiesToSet: PendingCookie[]
  cookiesToDelete: string[]
}
