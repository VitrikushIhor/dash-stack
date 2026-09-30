// The expiry hint only decides whether to refresh; the backend verifies session authority.
export function hasUnexpiredAccessToken(token: string | undefined): boolean {
  if (!token) {
    return false
  }

  try {
    const [, encodedPayload] = token.split('.')

    if (!encodedPayload) {
      return false
    }

    const normalizedPayload = encodedPayload
      .replaceAll('-', '+')
      .replaceAll('_', '/')
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=')
    const payload: unknown = JSON.parse(atob(normalizedPayload))

    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('exp' in payload)
    ) {
      return false
    }

    return (
      typeof payload.exp === 'number' &&
      Number.isFinite(payload.exp) &&
      payload.exp > Math.floor(Date.now() / 1000)
    )
  } catch {
    return false
  }
}
