'use client'

import { useMemo } from 'react'
import {
  AUTH_STATE_STATUS,
  type AuthState,
  useCurrentUserState,
} from '@/entities/user'
import { useMatchLeaderboard } from '@/entities/vocab'
import { useSessionStore } from '../../shared/use-session-store'
import { useStudyControllerFactories } from '../../study-controllers-provider'
import { MatchSessionStatus } from './match-session.contract'
import { useMatchProgressSync } from './use-match-progress-sync'

export { MatchSessionStatus } from './match-session.contract'

export function useMatchSession(
  deckId: string,
  filters: { onlyDue: boolean; onlyStarred: boolean }
) {
  const { onlyDue, onlyStarred } = filters
  const { authState, refetch: retryIdentity } = useCurrentUserState()
  const userId = getUserId(authState)
  const { matchSession } = useStudyControllerFactories()
  const store = useMemo(
    () => matchSession({ deckId, onlyDue, onlyStarred, userId }),
    [deckId, matchSession, onlyDue, onlyStarred, userId]
  )
  const { status, session, completion, error, restartVersion, restart } =
    useSessionStore(store)
  const leaderboard = useMatchLeaderboard(deckId, {
    enabled:
      authState.status === AUTH_STATE_STATUS.GUEST || completion !== null,
  })
  const sync = useMatchProgressSync({
    store,
    restartVersion,
    onComplete: leaderboard.refetch,
  })
  return {
    status:
      authState.status === AUTH_STATE_STATUS.ERROR
        ? MatchSessionStatus.ERROR
        : status,
    session,
    completion,
    error:
      authState.status === AUTH_STATE_STATUS.ERROR ? authState.message : error,
    leaderboard,
    restart,
    ...sync,
    retry:
      authState.status === AUTH_STATE_STATUS.ERROR
        ? () => void retryIdentity()
        : sync.retry,
  }
}

function getUserId(authState: AuthState): string | null | undefined {
  if (authState.status === AUTH_STATE_STATUS.AUTHENTICATED)
    return authState.user.id
  if (authState.status === AUTH_STATE_STATUS.GUEST) return null

  return undefined
}
