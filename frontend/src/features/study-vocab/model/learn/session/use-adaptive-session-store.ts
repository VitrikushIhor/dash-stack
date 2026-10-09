'use client'

import { useMemo } from 'react'
import { useSessionStore } from '../../shared/use-session-store'
import { useStudyControllerFactories } from '../../study-controllers-provider'

export function useAdaptiveLearnStore(storageKey: string, deckId: string) {
  const { learnSession } = useStudyControllerFactories()
  const store = useMemo(
    () => learnSession({ storageKey, deckId }),
    [deckId, learnSession, storageKey]
  )

  return useSessionStore(store)
}
