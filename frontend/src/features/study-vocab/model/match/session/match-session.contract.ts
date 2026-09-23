import { type MatchCompletion, type MatchSession } from '@/entities/vocab'
import { type SessionLifecycle } from '../../shared/session-lifecycle'

export const MatchSessionStatus = {
  AUTH_LOADING: 'auth-loading',
  GUEST: 'guest',
  LOADING: 'loading',
  PLAYING: 'playing',
  COMPLETING: 'completing',
  COMPLETE: 'complete',
  ERROR: 'error',
} as const
export type MatchSessionStatus =
  (typeof MatchSessionStatus)[keyof typeof MatchSessionStatus]

export interface MatchSessionScope {
  deckId: string
  onlyDue: boolean
  onlyStarred: boolean
  userId: string | null | undefined
}

export interface MatchSessionStore extends SessionLifecycle {
  scope: MatchSessionScope
  status: MatchSessionStatus
  session: MatchSession | null
  completion: MatchCompletion | null
  error: string | null
  restartVersion: number
  beginCreation: () => number | null
  beginCompletion: () => number | null
  isCurrent: (revision: number) => boolean
  receiveSession: (session: MatchSession, revision: number) => void
  receiveCompletion: (completion: MatchCompletion, revision: number) => void
  fail: (error: unknown, revision: number) => void
  restart: () => void
}
