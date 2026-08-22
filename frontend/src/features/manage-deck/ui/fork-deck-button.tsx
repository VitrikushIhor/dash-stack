'use client'

import React from 'react'
import { GitFork, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import { useForkDeck } from '../model/use-fork-deck'

interface ForkDeckButtonProps {
  deckId: string
  deckTitle?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function ForkDeckButton({
  deckId,
  deckTitle,
  variant = 'outline',
  size = 'sm',
  className,
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
      className={`gap-1.5 ${className || ''}`}
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
