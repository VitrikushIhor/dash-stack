'use client'

import React from 'react'
import { ErrorFallback } from '@/shared/ui/error-state'
import { useDueReviews } from '@/entities/vocab'
import { DueBadge } from './due-badge'
import { useDueCount } from './due-reviews-provider'

interface DeckDueBadgeProps {
  deckId: string
  className?: string
}

function DeckDueBadgeStandalone({ deckId, className }: DeckDueBadgeProps) {
  const { data, isError, isLoading } = useDueReviews({ deckId })

  if (isError) {
    return <ErrorFallback message='Failed to load due reviews' />
  }

  if (isLoading || !data) {
    return null
  }

  return <DueBadge count={data.totalDue} className={className} />
}

export function DeckDueBadge({ deckId, className }: DeckDueBadgeProps) {
  const contextCount = useDueCount(deckId)

  if (contextCount !== null) {
    return <DueBadge count={contextCount} className={className} />
  }

  return <DeckDueBadgeStandalone deckId={deckId} className={className} />
}
