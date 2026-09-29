import { extractSessionTokens } from '@/shared/api/session'
import { setAuthCookies } from '@/shared/lib/session-cookies'

export async function persistAuthCookies(response: Response): Promise<void> {
  const tokens = extractSessionTokens(response.headers)

  if (tokens) {
    await setAuthCookies(tokens)
  }
}
