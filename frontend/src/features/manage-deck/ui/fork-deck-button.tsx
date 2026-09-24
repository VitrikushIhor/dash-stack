'use client'

import React from 'react'
import { GitFork, Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui/core/button'
import { useForkDeck } from '../model/use-fork-deck'

interface ForkDeckButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  'children' | 'disabled' | 'onClick'
> {
  deckId: string
  deckTitle?: string
}

export function ForkDeckButton({
  deckId,
  deckTitle,
  variant = 'outline',
  size = 'sm',
  className,
  ...buttonProps
}: ForkDeckButtonProps) {
  const { isPending, handleFork } = useForkDeck(deckId, deckTitle)

  return (
    <Button
      variant={variant}
      size={size}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleFork()
      }}
      disabled={isPending}
      className={cn('gap-1.5', className)}
      {...buttonProps}
    >
      {isPending ? (
        <Loader2 className='h-3.5 w-3.5 animate-spin' />
      ) : (
        <GitFork className='h-3.5 w-3.5 text-emerald-500' />
      )}
      <span>{isPending ? 'Forking...' : 'Fork Deck'}</span>
    </Button>
  )
}
