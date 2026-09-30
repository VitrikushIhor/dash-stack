export function parseSessionUserAgent(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const userAgent = value.trim();
  if (
    !userAgent ||
    userAgent.length > 512 ||
    Array.from(userAgent).some((character) => {
      const codePoint = character.codePointAt(0);
      return codePoint !== undefined && (codePoint < 32 || codePoint === 127);
    })
  )
    return undefined;
  return userAgent;
}
