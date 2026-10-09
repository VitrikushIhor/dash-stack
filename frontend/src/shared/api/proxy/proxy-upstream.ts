import type { NextRequest } from 'next/server'
import { env } from '@/shared/config/env'
import { PROXY_ERROR_CONFIG } from './errors/proxy-error-config'
import { proxyErrorResponse } from './errors/proxy-errors'
import type { ProxyRequestContext } from './proxy.types'

const BASE_URL = env.API_URL ?? 'http://localhost:8000'
const UPSTREAM_TIMEOUT_MS = 30_000

export async function fetchUpstream(
  url: string,
  init: RequestInit,
  requestSignal?: AbortSignal
): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)

  const response = await fetch(url, {
    ...init,
    redirect: 'manual',
    signal: requestSignal
      ? AbortSignal.any([requestSignal, timeoutSignal])
      : timeoutSignal,
  })

  if (response.status >= 300 && response.status < 400) {
    return proxyErrorResponse(PROXY_ERROR_CONFIG.UPSTREAM_REDIRECT)
  }

  return response
}

export function buildUpstreamUrl(path: string[], search: string): string {
  return `${BASE_URL}/api/${path.map(encodeURIComponent).join('/')}${search}`
}

export function sendUpstreamRequest(
  req: NextRequest,
  context: ProxyRequestContext
): Promise<Response> {
  return fetchUpstream(
    buildUpstreamUrl(context.normalizedPath, context.search),
    { method: req.method, headers: context.headers, body: context.body },
    req.signal
  )
}
