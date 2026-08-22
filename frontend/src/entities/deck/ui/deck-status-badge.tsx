import React from 'react'
import { Badge } from '@/shared/ui/core/badge'
import { DeckStatusEnum } from '../model/types'

interface DeckStatusBadgeProps {
  status: DeckStatusEnum
  className?: string
}

export function DeckStatusBadge({ status, className }: DeckStatusBadgeProps) {
  switch (status) {
    case DeckStatusEnum.PUBLISHED:
      return (
        <Badge
          variant='secondary'
          className={`border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ${className || ''}`}
        >
          Published
        </Badge>
      )
    case DeckStatusEnum.ARCHIVED:
      return (
        <Badge
          variant='secondary'
          className={`border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 ${className || ''}`}
        >
          Archived
        </Badge>
      )
    case DeckStatusEnum.DRAFT:
    default:
      return (
        <Badge
          variant='secondary'
          className={`border-zinc-500/20 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 ${className || ''}`}
        >
          Draft
        </Badge>
      )
  }
}
