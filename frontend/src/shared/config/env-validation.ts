const LOOPBACK_HOSTNAMES: ReadonlySet<string> = new Set([
  'localhost',
  '127.0.0.1',
  '[::1]',
])
const AUTH0_DOMAIN_PATTERN =
  /^(?!.*(?:change.?me|placeholder|your-))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i
const PLACEHOLDER_PATTERN = /(?:change.?me|placeholder|your-)/i

export function isValidProductionOrigin(value: string): boolean {
  try {
    const url = new URL(value)
    const isLoopback = LOOPBACK_HOSTNAMES.has(url.hostname)

    return (
      url.origin === value &&
      !url.username &&
      !url.password &&
      (url.protocol === 'https:' || (isLoopback && url.protocol === 'http:'))
    )
  } catch {
    return false
  }
}

export function isValidOAuthConfiguration(
  domain: string | undefined,
  clientId: string | undefined,
  appUrl: string | undefined
): boolean {
  if (!domain || !clientId || !appUrl) return false

  return (
    AUTH0_DOMAIN_PATTERN.test(domain) &&
    !domain.includes('..') &&
    !PLACEHOLDER_PATTERN.test(clientId) &&
    isValidProductionOrigin(appUrl)
  )
}
