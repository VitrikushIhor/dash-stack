'use client'

import React from 'react'
import Link from 'next/link'
import { Layers, MoreVertical, Sparkles } from 'lucide-react'
import { Badge } from '@/shared/ui/core/badge'
import { Button } from '@/shared/ui/core/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/core/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/ui/core/dropdown-menu'
import { type Deck, DeckTypeEnum } from '../model/types'
import { DeckLevelBadge } from './deck-level-badge'

interface DeckCardProps {
  deck: Deck
  href: string
  statusBadgeSlot?: React.ReactNode
  dropdownActionsSlot?: React.ReactNode
  footerActionsSlot?: React.ReactNode
}

export function DeckCard({
  deck,
  href,
  statusBadgeSlot,
  dropdownActionsSlot,
  footerActionsSlot,
}: DeckCardProps) {
  const cardCount = deck.cardCount ?? deck.flashcards?.length ?? 0
  const isSystem = deck.type === DeckTypeEnum.SYSTEM

  return (
    <Card className='group border-border/60 bg-card/60 hover:border-primary/40 hover:shadow-primary/5 relative flex flex-col justify-between overflow-hidden backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
      <div className='from-primary/40 via-primary to-primary/40 absolute inset-x-0 top-0 h-1 bg-linear-to-r opacity-0 transition-opacity group-hover:opacity-100' />

      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex flex-wrap items-center gap-1.5'>
            <DeckLevelBadge level={deck.level} />
            {statusBadgeSlot}
            {isSystem && (
              <Badge
                variant='outline'
                className='gap-1 border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400'
              >
                <Sparkles className='h-3 w-3' /> Official
              </Badge>
            )}
          </div>

          {dropdownActionsSlot && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-muted-foreground hover:text-foreground h-8 w-8'
                >
                  <MoreVertical className='h-4 w-4' />
                  <span className='sr-only'>Open deck menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                {dropdownActionsSlot}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <CardTitle className='group-hover:text-primary line-clamp-1 pt-2 text-lg font-bold transition-colors'>
          <Link href={href}>{deck.title}</Link>
        </CardTitle>

        {deck.description && (
          <CardDescription className='line-clamp-2 min-h-10 text-xs leading-relaxed'>
            {deck.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className='pt-0 pb-3'>
        {deck.tags && deck.tags.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {deck.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className='bg-muted/60 text-muted-foreground rounded-md px-2 py-0.5 text-[11px] font-medium'
              >
                #{tag}
              </span>
            ))}
            {deck.tags.length > 3 && (
              <span className='bg-muted/60 text-muted-foreground rounded-md px-1.5 py-0.5 text-[11px] font-medium'>
                +{deck.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className='border-border/40 bg-muted/20 text-muted-foreground flex items-center justify-between border-t px-6 py-3 text-xs'>
        <div className='flex items-center gap-1.5 font-medium'>
          <Layers className='text-primary h-3.5 w-3.5' />
          <span>
            {cardCount} {cardCount === 1 ? 'card' : 'cards'}
          </span>
        </div>

        {footerActionsSlot && (
          <div className='flex items-center gap-2'>{footerActionsSlot}</div>
        )}
      </CardFooter>
    </Card>
  )
}
