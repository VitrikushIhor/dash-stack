import { createHash, randomBytes } from 'node:crypto'
import type { OAuthAuthorization } from './oauth.types'

export function createOAuthAuthorization(
  domain: string,
  clientId: string,
  appUrl: URL,
  connection: string
): OAuthAuthorization {
  const state = randomBytes(32).toString('base64url')
  const verifier = randomBytes(32).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  const callbackUrl = new URL('/api/auth/oauth/callback', appUrl)
  const url = new URL(`https://${domain}/authorize`)

  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', callbackUrl.toString())
  url.searchParams.set('connection', connection)
  url.searchParams.set('scope', 'openid profile email')
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')

  return { url, state, verifier }
}
