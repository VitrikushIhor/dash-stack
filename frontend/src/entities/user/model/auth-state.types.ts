import type { AUTH_STATE_STATUS } from './auth-state-status'
import type { User } from './types'

export type AuthState =
  | { status: typeof AUTH_STATE_STATUS.LOADING }
  | { status: typeof AUTH_STATE_STATUS.GUEST }
  | { status: typeof AUTH_STATE_STATUS.AUTHENTICATED; user: User }
  | { status: typeof AUTH_STATE_STATUS.ERROR; message: string }
