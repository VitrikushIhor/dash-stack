'use client'

import { useMemo } from 'react'
import { getErrorMessage } from '@/shared/api'
import { useCurrentUser } from '@/entities/user'
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
  const {
    data: user,
    error: identityError,
    isError: isIdentityError,
    refetch: retryIdentity,
  } = useCurrentUser()
  const userId = getUserId(user)
  const { matchSession } = useStudyControllerFactories()
  const store = useMemo(
    () => matchSession({ deckId, onlyDue, onlyStarred, userId }),
    [deckId, matchSession, onlyDue, onlyStarred, userId]
  )
  const { status, session, completion, error, restartVersion, restart } =
    useSessionStore(store)
  const leaderboard = useMatchLeaderboard(deckId, {
    enabled: user === null || completion !== null,
  })
  const sync = useMatchProgressSync({
    store,
    restartVersion,
    onComplete: leaderboard.refetch,
  })
  // TODO(auth-refactor): remove this feature-level identity error bridge when
  // the auth provider owns loading/error/guest transitions globally.
  const hasIdentityError = user === undefined && isIdentityError

  return {
    status: hasIdentityError ? MatchSessionStatus.ERROR : status,
    session,
    completion,
    error: hasIdentityError ? getErrorMessage(identityError) : error,
    leaderboard,
    restart,
    ...sync,
    retry: hasIdentityError ? () => void retryIdentity() : sync.retry,
  }
}

function getUserId(
  user: ReturnType<typeof useCurrentUser>['data']
): string | null | undefined {
  if (user === undefined || user === null) return user

  return user.id
}
