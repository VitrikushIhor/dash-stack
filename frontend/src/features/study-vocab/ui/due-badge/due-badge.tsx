import React from 'react'
import { CalendarClock } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/core/badge'

interface DueBadgeProps {
  count: number
  className?: string
}

export function DueBadge({ count, className }: DueBadgeProps) {
  if (count <= 0) return null

  return (
    <Badge
      variant='secondary'
      className={cn(
        'gap-1.5 bg-orange-100 px-2 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
        className
      )}
    >
      <CalendarClock className='h-3.5 w-3.5' />
      <span>{count} due</span>
    </Badge>
  )
}
