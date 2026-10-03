'use client'

import React from 'react'
import { WidgetErrorState } from '@/shared/ui/feedback'
import { useDueReviews } from '@/entities/vocab'
import { DueBadge } from './due-badge'
import { useDueCount } from './due-reviews-provider'

interface DeckDueBadgeProps {
  deckId: string
  className?: string
}

function DeckDueBadgeStandalone({ deckId, className }: DeckDueBadgeProps) {
  const { data, isError, isLoading, refetch } = useDueReviews({ deckId })

  if (isError) {
    return (
      <WidgetErrorState
        size='compact'
        title='Review count unavailable'
        description='Try loading this deck again.'
        onRetry={() => void refetch()}
        className='rounded-md p-2'
      />
    )
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
