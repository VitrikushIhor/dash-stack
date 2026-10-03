import type { NextRequest } from 'next/server'
import { PROXY_ERROR_CONFIG } from './errors/proxy-error-config'
import { proxyErrorResponse } from './errors/proxy-errors'
import { buildProxyResponse } from './proxy-response'
import { handleUnauthorizedResponse } from './proxy-session'
import { sendUpstreamRequest } from './proxy-upstream'
import { isTrustedMutation, normalizePath } from './request/proxy-request'
import { createProxyRequestContext } from './request/proxy-request-context'

export async function forwardProxyRequestFacade(
  req: NextRequest,
  path: string[]
) {
  if (!isTrustedMutation(req)) {
    return proxyErrorResponse(PROXY_ERROR_CONFIG.CSRF_FORBIDDEN, {
      'Cache-Control': 'no-store',
    })
  }

  const normalizedPath = normalizePath(path)
  if (!normalizedPath) {
    return proxyErrorResponse(PROXY_ERROR_CONFIG.INVALID_PATH)
  }

  const prepared = await createProxyRequestContext(req, normalizedPath)
  if (!prepared.ok) return prepared.response

  const { context } = prepared
  let response: Response

  try {
    response = await sendUpstreamRequest(req, context)
  } catch {
    return proxyErrorResponse(PROXY_ERROR_CONFIG.UPSTREAM_UNAVAILABLE)
  }

  const session = await handleUnauthorizedResponse(req, context, response)
  return buildProxyResponse(
    session.response,
    context.requestId,
    session.cookiesToSet,
    session.cookiesToDelete
  )
}
