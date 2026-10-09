import type { NextRequest } from 'next/server'
import { parseFrontendEnv } from '@/shared/config/env'
import type { FrontendEnv } from '@/shared/config/env.types'
import type { OAuthRouteConfig } from './oauth.types'

export function resolveOAuthRouteConfig(
  requestOrigin: string
): OAuthRouteConfig | null {
  let configured: FrontendEnv

  try {
    configured = parseFrontendEnv(process.env)
  } catch {
    return null
  }

  const frontendUrl =
    configured.NEXT_PUBLIC_APP_URL ??
    configured.FRONTEND_URL ??
    (configured.NODE_ENV === 'production' ? undefined : 'http://localhost:3000')

  if (!frontendUrl) return null

  try {
    const appUrl = new URL(frontendUrl)
    if (appUrl.origin !== requestOrigin) return null

    return {
      appUrl,
      apiUrl: configured.API_URL ?? 'http://localhost:8000',
      auth0Domain: configured.NEXT_PUBLIC_AUTH0_DOMAIN,
      auth0ClientId: configured.NEXT_PUBLIC_AUTH0_CLIENT_ID,
    }
  } catch {
    return null
  }
}

export function resolveOAuthRequestConfig(
  request: NextRequest
): OAuthRouteConfig | null {
  // Next may use localhost internally; only the configured public origin is accepted.
  const host = request.headers.get('host') ?? request.nextUrl.host
  try {
    const publicUrl = new URL(`${request.nextUrl.protocol}//${host}`)
    if (
      publicUrl.host !== host ||
      publicUrl.pathname !== '/' ||
      publicUrl.search ||
      publicUrl.hash
    )
      return null
    return resolveOAuthRouteConfig(publicUrl.origin)
  } catch {
    return null
  }
}
