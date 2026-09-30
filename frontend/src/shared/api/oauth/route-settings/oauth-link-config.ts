export const OAUTH_LINK_RESULT = {
  SUCCESS: 'success',
  FAILED: 'failed',
} as const

export type OAuthLinkResult =
  (typeof OAUTH_LINK_RESULT)[keyof typeof OAUTH_LINK_RESULT]

export const OAUTH_LINK_CONFIG = {
  RESULT_QUERY_KEY: 'link',
  REDIRECT_STATUS: 303,
} as const

export function parseOAuthLinkResult(
  value: unknown
): OAuthLinkResult | undefined {
  return value === OAUTH_LINK_RESULT.SUCCESS ||
    value === OAUTH_LINK_RESULT.FAILED
    ? value
    : undefined
}
