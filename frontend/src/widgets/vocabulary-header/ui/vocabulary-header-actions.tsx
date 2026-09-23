'use client'

import { type ReactNode, useSyncExternalStore } from 'react'

type VocabularyHeaderActionsProps = {
  children: ReactNode
  fallback: ReactNode
}

const subscribe = () => () => undefined
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function VocabularyHeaderActions({
  children,
  fallback,
}: VocabularyHeaderActionsProps) {
  const isHydrated = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  )

  return isHydrated ? children : fallback
}
