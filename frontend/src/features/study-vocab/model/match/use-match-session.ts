'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAction } from '@/shared/lib'
import { useCurrentUser } from '@/entities/user'
import {
  type MatchCompletion,
  type MatchSession,
  useMatchLeaderboard,
} from '@/entities/vocab'
import {
  completeMatchSessionAction,
  createMatchSessionAction,
  recordMatchPairAction,
} from '../../server'

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

export function useMatchSession(
  deckId: string,
  filters: { onlyDue: boolean; onlyStarred: boolean }
) {
  const { onlyDue, onlyStarred } = filters
  const { data: user } = useCurrentUser()
  const [session, setSession] = useState<MatchSession | null>(null)
  const [completion, setCompletion] = useState<MatchCompletion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [restartVersion, setRestartVersion] = useState(0)
  const creationStarted = useRef(false)
  const completionStarted = useRef(false)

  const { execute: createSession, isPending: isCreating } = useAction(
    createMatchSessionAction,
    {
      onSuccess: setSession,
      onError: (message) => {
        creationStarted.current = false
        setError(message)
      },
    }
  )

  const { execute: completeSession, isPending: isCompleting } = useAction(
    completeMatchSessionAction,
    {
      onSuccess: setCompletion,
      onError: (message) => {
        completionStarted.current = false
        setError(message)
      },
    }
  )

  const { execute: savePair } = useAction(recordMatchPairAction)

  const leaderboard = useMatchLeaderboard(deckId, {
    enabled: user === null || completion !== null,
  })

  const { refetch: refetchLeaderboard } = leaderboard

  useEffect(() => {
    if (!user || creationStarted.current) return
    creationStarted.current = true
    setError(null)
    void createSession({ deckId, onlyDue, onlyStarred })
  }, [createSession, deckId, onlyDue, onlyStarred, restartVersion, user])

  const complete = useCallback(async () => {
    if (!session || completionStarted.current) return
    completionStarted.current = true
    setError(null)
    const result = await completeSession({ deckId, sessionId: session.id })

    if (result) await refetchLeaderboard()
  }, [completeSession, deckId, refetchLeaderboard, session])

  const recordPair = useCallback(
    async (cardId: string) => {
      if (!session) return false
      const result = await savePair({ deckId, sessionId: session.id, cardId })

      return result !== undefined
    },
    [deckId, savePair, session]
  )

  const restart = useCallback(() => {
    completionStarted.current = false
    creationStarted.current = false
    setSession(null)
    setCompletion(null)
    setError(null)
    setRestartVersion((value) => value + 1)
  }, [])

  const retry = useCallback(() => {
    if (session && completionStarted.current === false) void complete()
    else restart()
  }, [complete, restart, session])

  let status: MatchSessionStatus = MatchSessionStatus.AUTH_LOADING

  if (user === null) status = MatchSessionStatus.GUEST
  else if (user && isCreating) status = MatchSessionStatus.LOADING
  else if (error) status = MatchSessionStatus.ERROR
  else if (completion) status = MatchSessionStatus.COMPLETE
  else if (isCompleting) status = MatchSessionStatus.COMPLETING
  else if (session) status = MatchSessionStatus.PLAYING

  return {
    status,
    session,
    completion,
    error,
    leaderboard,
    complete,
    recordPair,
    restart,
    retry,
  }
}
