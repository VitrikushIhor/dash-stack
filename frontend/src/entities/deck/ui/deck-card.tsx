'use client'

import React, { type ReactNode, createContext, useContext } from 'react'
import Link from 'next/link'
import { Layers, MoreVertical, Sparkles } from 'lucide-react'
import { getInitials } from '@/shared/lib'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/core/avatar'
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

interface DeckCardContextValue {
  deck: Deck
  href?: string
}

const DeckCardContext = createContext<DeckCardContextValue | null>(null)

function useDeckCard() {
  const context = useContext(DeckCardContext)

  if (!context) {
    throw new Error('DeckCard components must be used within DeckCard')
  }

  return context
}

interface DeckCardProps {
  deck: Deck
  href?: string
  children: ReactNode
}

function Root({ deck, href, children }: DeckCardProps) {
  return (
    <DeckCardContext.Provider value={{ deck, href }}>
      <Card className='group border-border/60 bg-card/60 hover:border-primary/40 hover:shadow-primary/5 relative flex flex-col justify-between overflow-hidden backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
        <div className='from-primary/40 via-primary to-primary/40 absolute inset-x-0 top-0 h-1 bg-linear-to-r opacity-0 transition-opacity group-hover:opacity-100' />
        {children}
      </Card>
    </DeckCardContext.Provider>
  )
}

function Header({ children }: { children?: ReactNode }) {
  return (
    <CardHeader className='pb-3'>
      <div className='flex items-start justify-between gap-2'>{children}</div>
    </CardHeader>
  )
}

function Badges({ children }: { children?: ReactNode }) {
  const { deck } = useDeckCard()
  const isSystem = deck.type === DeckTypeEnum.SYSTEM

  return (
    <div className='flex flex-wrap items-center gap-1.5'>
      <DeckLevelBadge level={deck.level} />
      {children}
      {isSystem && (
        <Badge
          variant='outline'
          className='gap-1 border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400'
        >
          <Sparkles className='h-3 w-3' /> Official
        </Badge>
      )}
    </div>
  )
}

function Actions({ children }: { children: ReactNode }) {
  return (
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
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Content() {
  const { deck, href } = useDeckCard()

  return (
    <>
      <CardHeader className='pt-0 pb-3'>
        <CardTitle className='group-hover:text-primary line-clamp-1 pt-2 text-lg font-bold transition-colors'>
          {href ? <Link href={href}>{deck.title}</Link> : deck.title}
        </CardTitle>

        {deck.description && (
          <CardDescription className='line-clamp-2 min-h-10 text-xs leading-relaxed'>
            {deck.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className='pt-0 pb-3'>
        {deck.creator ? (
          <div className='text-muted-foreground mb-3 flex items-center gap-2 text-xs'>
            <Avatar className='h-6 w-6'>
              {deck.creator.avatarUrl ? (
                <AvatarImage
                  src={deck.creator.avatarUrl}
                  alt={deck.creator.displayName ?? 'Creator avatar'}
                />
              ) : null}
              <AvatarFallback>
                {getInitials(deck.creator.displayName ?? 'Creator')}
              </AvatarFallback>
            </Avatar>
            <span>{deck.creator.displayName ?? 'Creator'}</span>
          </div>
        ) : null}
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
    </>
  )
}

function Footer({ children }: { children?: ReactNode }) {
  const { deck } = useDeckCard()
  const cardCount = deck.cardCount ?? deck.flashcards?.length ?? 0

  return (
    <CardFooter className='border-border/40 bg-muted/20 text-muted-foreground flex items-center justify-between border-t px-6 py-3 text-xs'>
      <div className='flex items-center gap-3 font-medium'>
        <div className='flex items-center gap-1.5'>
          <Layers className='text-primary h-3.5 w-3.5' />
          <span>
            {cardCount} {cardCount === 1 ? 'card' : 'cards'}
          </span>
        </div>
        {deck.forkCount !== undefined ? (
          <span>
            {deck.forkCount} {deck.forkCount === 1 ? 'fork' : 'forks'}
          </span>
        ) : null}
      </div>

      {children && <div className='flex items-center gap-2'>{children}</div>}
    </CardFooter>
  )
}

export const DeckCard = Object.assign(Root, {
  Header,
  Badges,
  Actions,
  Content,
  Footer,
})
