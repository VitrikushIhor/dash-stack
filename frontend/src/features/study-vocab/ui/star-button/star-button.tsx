'use client'

import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/core/button'

interface StarButtonProps {
  isStarred: boolean
  onClick: (e?: React.MouseEvent) => void
  className?: string
}

export function StarButton({ isStarred, onClick, className }: StarButtonProps) {
  return (
    <Button
      variant='ghost'
      size='icon'
      className={cn(
        'rounded-full transition-colors',
        isStarred
          ? 'text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-600'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      aria-label={isStarred ? 'Unstar card' : 'Star card'}
    >
      <Star className={cn('h-5 w-5', isStarred && 'fill-current')} />
    </Button>
  )
}
