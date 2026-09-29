export function parseSessionUserAgent(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const userAgent = value.trim();
  if (
    !userAgent ||
    userAgent.length > 512 ||
    Array.from(userAgent).some(
      (character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
    )
  )
    return undefined;
  return userAgent;
}
