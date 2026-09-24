'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { type User, useCurrentUser, userKeys } from '@/entities/user'
import { vocabKeys } from '@/entities/vocab'
import { canStartStudySync } from '../../shared/study-sync-guard'
import { type FlashcardResult } from '../../shared/types'
import { useSessionStore } from '../../shared/use-session-store'
import { useStudyControllerFactories } from '../../study-controllers-provider'
import { FlashcardProgressStatus } from './flashcard-progress.contract'
import { syncFlashcardProgress } from './sync-flashcard-progress'

export { FlashcardProgressStatus } from './flashcard-progress.contract'

interface UseFlashcardProgressSyncOptions {
  deckId: string
  onRecover: (results: FlashcardResult[]) => void
}

export function useFlashcardProgressSync({
  deckId,
  onRecover,
}: UseFlashcardProgressSyncOptions) {
  const { data: user } = useCurrentUser()
  const queryClient = useQueryClient()
  const { flashcardProgress } = useStudyControllerFactories()
  const store = useMemo(
    () => flashcardProgress(deckId),
    [deckId, flashcardProgress]
  )
  const { status, error, isSyncing, resolveIdentity } = useSessionStore(store)
  const userId = getUserId(user)

  const retry = useCallback(async () => {
    const saved = await syncFlashcardProgress(
      deckId,
      store,
      () => queryClient.getQueryData<User | null>(userKeys.me())?.id
    )

    if (saved)
      void queryClient.invalidateQueries({ queryKey: vocabKeys.dueReviews() })
  }, [deckId, queryClient, store])

  useEffect(() => {
    const results = resolveIdentity(userId)

    if (results) onRecover(results)
  }, [onRecover, resolveIdentity, userId])

  useEffect(() => {
    const canResumeSync = canStartStudySync({
      isPending: status === FlashcardProgressStatus.SAVING,
      isSyncing,
      isIdentityLoading: user === undefined,
      isEnabled: true,
    })

    if (canResumeSync) void retry()
  }, [isSyncing, retry, status, user])

  const complete = useCallback(
    (results: FlashcardResult[]) => {
      store.getState().complete(results, userId)
    },
    [store, userId]
  )

  return {
    complete,
    retry,
    status,
    error,
    isSubmitting:
      status === FlashcardProgressStatus.SAVING ||
      status === FlashcardProgressStatus.WAITING_FOR_IDENTITY,
  }
}

function getUserId(user: User | null | undefined): string | null | undefined {
  if (user === undefined || user === null) return user

  return user.id
}
