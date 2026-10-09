import type { SESSION_REFRESH_STATUS } from './session-refresh-status'

export interface SessionTokens {
  accessToken: string
  refreshToken: string
}

export type SessionRefreshOutcome =
  | { status: typeof SESSION_REFRESH_STATUS.SUCCESS; tokens: SessionTokens }
  | { status: typeof SESSION_REFRESH_STATUS.INVALID_SESSION }
  | { status: typeof SESSION_REFRESH_STATUS.INVALID_RESPONSE }
  | { status: typeof SESSION_REFRESH_STATUS.UNAVAILABLE }
