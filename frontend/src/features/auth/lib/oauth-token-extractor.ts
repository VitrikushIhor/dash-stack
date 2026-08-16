import { OAUTH_PARAMS } from '@/shared/config'

export interface OAuthCallbackParams {
  code?: string | null
  token?: string | null
  error?: string | null
}

export function extractOAuthToken(params: OAuthCallbackParams): string | null {
  if (params.code) return params.code
  if (params.token) return params.token

  if (typeof window === 'undefined') return null

  const searchParams = new URLSearchParams(window.location.search)
  const queryToken =
    searchParams.get(OAUTH_PARAMS.ACCESS_TOKEN) ||
    searchParams.get(OAUTH_PARAMS.TOKEN) ||
    searchParams.get(OAUTH_PARAMS.CODE)

  if (queryToken) return queryToken

  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const hashToken =
      hashParams.get(OAUTH_PARAMS.ACCESS_TOKEN) ||
      hashParams.get(OAUTH_PARAMS.TOKEN) ||
      hashParams.get(OAUTH_PARAMS.CODE)

    if (hashToken) return hashToken
  }

  return null
}
