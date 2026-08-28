'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { useDueReviews } from '@/entities/vocab'

const DueReviewsContext = createContext<Map<string, number> | null>(null)

export function useDueCount(deckId: string): number | null {
  const ctx = useContext(DueReviewsContext)
  if (!ctx) return null
  return ctx.get(deckId) ?? 0
}

export function DueReviewsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data } = useDueReviews()

  const dueMap = useMemo(
    () => new Map(data?.perDeck?.map((d) => [d.deckId, d.dueCount]) ?? []),
    [data?.perDeck]
  )

  return (
    <DueReviewsContext.Provider value={dueMap}>
      {children}
    </DueReviewsContext.Provider>
  )
}
