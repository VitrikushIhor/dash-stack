import { requestSessionRefresh } from './session-refresh-request'
import type { SessionRefreshOutcome } from './session-refresh.types'

export { extractSessionTokens } from './session-token-cookies'
export type {
  SessionRefreshOutcome,
  SessionTokens,
} from './session-refresh.types'

const activeRefreshes = new Map<string, Promise<SessionRefreshOutcome>>()

export function refreshSession(
  refreshToken: string,
  requestId?: string
): Promise<SessionRefreshOutcome> {
  const activeRefresh = activeRefreshes.get(refreshToken)

  if (activeRefresh !== undefined) return activeRefresh

  const refresh = requestSessionRefresh(refreshToken, requestId)

  activeRefreshes.set(refreshToken, refresh)
  void refresh.finally(() => {
    if (activeRefreshes.get(refreshToken) === refresh) {
      activeRefreshes.delete(refreshToken)
    }
  })

  return refresh
}
