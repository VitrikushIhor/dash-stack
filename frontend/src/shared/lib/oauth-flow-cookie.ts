import { getCookieOptions } from './session-cookies'

export function getOAuthFlowCookie(state: string, maxAge: number) {
  const production = process.env.NODE_ENV === 'production'
  const options = getCookieOptions(maxAge)
  return {
    name: `${production ? '__Host-' : ''}oauth_flow_${state}`,
    options: {
      ...options,
      path: production ? '/' : '/api/auth/oauth/callback',
      secure: production || options.secure,
    },
  }
}
