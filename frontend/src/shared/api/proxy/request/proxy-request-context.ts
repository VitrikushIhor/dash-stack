import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { randomUUID } from 'node:crypto'
import { COOKIE_CONFIG } from '@/shared/lib/session-cookies'
import { PROXY_ERROR_CONFIG } from '../errors/proxy-error-config'
import { proxyErrorResponse } from '../errors/proxy-errors'
import type {
  ProxyRequestContext,
  ProxyRequestPreparation,
} from '../proxy.types'
import { BODY_LESS_PROXY_METHODS } from './proxy-method-groups'
import { maxRequestBodyBytes, readBoundedBody } from './proxy-request'

export async function createProxyRequestContext(
  req: NextRequest,
  normalizedPath: string[]
): Promise<ProxyRequestPreparation> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_CONFIG.ACCESS_TOKEN.name)?.value
  const refreshToken = cookieStore.get(COOKIE_CONFIG.REFRESH_TOKEN.name)?.value
  const contentType = req.headers.get('content-type')
  const accept = req.headers.get('accept')
  const requestId = randomUUID()

  const headers: Record<string, string> = {
    'X-Request-Id': requestId,
    ...(contentType && { 'Content-Type': contentType }),
    Accept: accept ?? 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  let body: ArrayBuffer | undefined

  if (!BODY_LESS_PROXY_METHODS.includes(req.method)) {
    let buffer: ArrayBuffer | null

    try {
      buffer = await readBoundedBody(
        req,
        maxRequestBodyBytes(normalizedPath, req.method, contentType)
      )
    } catch {
      return {
        ok: false,
        response: proxyErrorResponse(PROXY_ERROR_CONFIG.INVALID_REQUEST_BODY),
      }
    }

    if (buffer === null) {
      return {
        ok: false,
        response: proxyErrorResponse(PROXY_ERROR_CONFIG.PAYLOAD_TOO_LARGE),
      }
    }

    if (buffer.byteLength > 0) body = buffer
  }

  const context: ProxyRequestContext = {
    normalizedPath,
    search: req.nextUrl.search,
    requestId,
    refreshToken,
    headers,
    body,
  }

  return { ok: true, context }
}
