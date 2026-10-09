import Link from 'next/link'
import { Languages, Layers3 } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { Badge } from '@/shared/ui/core/badge'
import { type Deck } from '@/entities/deck'
import { CopyDeckLinkButton } from './copy-deck-link-button'
import { DeckBoardHeaderActions } from './deck-board-header-actions'

type DeckBoardHeaderProps = {
  deck: Deck
  cardCount: number
  isOwner: boolean
  isAuthenticated: boolean
}

export function DeckBoardHeader({
  deck,
  cardCount,
  isOwner,
  isAuthenticated,
}: DeckBoardHeaderProps) {
  return (
    <header className='mb-8 flex flex-col gap-6 border-b pb-8 lg:flex-row lg:items-start lg:justify-between'>
      <div className='max-w-3xl space-y-4'>
        <Link
          href={ROUTES.vocabCatalog}
          className='text-muted-foreground text-sm hover:underline'
        >
          Vocabulary catalog
        </Link>

        <div>
          <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
            {deck.title}
          </h1>

          {deck.description && (
            <p className='text-muted-foreground mt-3 max-w-2xl text-base leading-7'>
              {deck.description}
            </p>
          )}
        </div>

        <div
          aria-label='Deck metadata'
          className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-sm capitalize'
        >
          <span className='flex items-center gap-1.5'>
            <Layers3 />
            {cardCount} cards
          </span>

          <span className='flex items-center gap-1.5'>
            <Languages />
            {deck.language}
          </span>

          {deck.creator?.displayName && <span>{deck.creator.displayName}</span>}

          {deck.forkCount !== undefined && (
            <span>
              {deck.forkCount} {deck.forkCount === 1 ? 'fork' : 'forks'}
            </span>
          )}

          <Badge variant='outline'>{deck.visibility.toLowerCase()}</Badge>

          {deck.level && <Badge variant='secondary'>{deck.level}</Badge>}

          {deck.tags.map((tag) => (
            <Badge key={tag} variant='outline'>
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className='flex gap-2'>
        <CopyDeckLinkButton deckId={deck.id} />

        <DeckBoardHeaderActions
          deck={deck}
          isOwner={isOwner}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </header>
  )
}
