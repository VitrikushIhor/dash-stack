import React from 'react'
import { Badge } from '@/shared/ui/core/badge'
import { CEFRLevelEnum } from '../model/types'

interface DeckLevelBadgeProps {
  level?: CEFRLevelEnum | null
  className?: string
}

export function DeckLevelBadge({ level, className }: DeckLevelBadgeProps) {
  if (!level) return null

  const colorStyles: Record<CEFRLevelEnum, string> = {
    [CEFRLevelEnum.A1]:
      'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
    [CEFRLevelEnum.A2]:
      'bg-teal-500/10 text-teal-600 border-teal-500/20 dark:text-teal-400',
    [CEFRLevelEnum.B1]:
      'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400',
    [CEFRLevelEnum.B2]:
      'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
    [CEFRLevelEnum.C1]:
      'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400',
    [CEFRLevelEnum.C2]:
      'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400',
  }

  return (
    <Badge
      variant='secondary'
      className={`font-semibold tracking-wide ${colorStyles[level] || ''} ${className || ''}`}
    >
      {level}
    </Badge>
  )
}
