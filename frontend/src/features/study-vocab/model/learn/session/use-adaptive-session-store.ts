'use client'

import { useEffect, useMemo } from 'react'
import { useStore } from 'zustand'
import { createAdaptiveLearnStore } from './adaptive-session.store'

export function useAdaptiveLearnStore(storageKey: string, deckId: string) {
  const store = useMemo(
    () => createAdaptiveLearnStore({ storageKey, deckId }),
    [deckId, storageKey]
  )

  useEffect(() => {
    const lease = store.getState().activate()
    return () => {
      store.getState().deactivate(lease)
    }
  }, [store])

  return useStore(store)
}
