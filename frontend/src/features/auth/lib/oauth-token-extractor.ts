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
    searchParams.get('access_token') ||
    searchParams.get('token') ||
    searchParams.get('code')

  if (queryToken) return queryToken

  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const hashToken =
      hashParams.get('access_token') ||
      hashParams.get('token') ||
      hashParams.get('code')

    if (hashToken) return hashToken
  }

  return null
}
