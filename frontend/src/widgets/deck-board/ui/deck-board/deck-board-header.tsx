'use client'

import Link from 'next/link'
import { Copy, Languages, Layers3, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { ROUTES } from '@/shared/config'
import { Badge } from '@/shared/ui/core/badge'
import { Button } from '@/shared/ui/core/button'
import { type Deck } from '@/entities/deck'
import { ExportDeckButton } from '@/features/export-flashcards'
import {
  ImportDialog,
  importFlashcardsAction,
} from '@/features/import-flashcards'
import { ForkDeckButton } from '@/features/manage-deck'

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
  const copyLink = async () => {
    try {
      const shareUrl = new URL(
        ROUTES.vocabDeck(deck.id),
        window.location.origin
      )

      await navigator.clipboard.writeText(shareUrl.toString())
      toast.success('Deck link copied')
    } catch {
      toast.error('Could not copy the deck link')
    }
  }

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
          {deck.description ? (
            <p className='text-muted-foreground mt-3 max-w-2xl text-base leading-7'>
              {deck.description}
            </p>
          ) : null}
        </div>
        <div className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-sm'>
          <span className='flex items-center gap-1.5'>
            <Layers3 />
            {cardCount} cards
          </span>
          <span className='flex items-center gap-1.5'>
            <Languages />
            {deck.language}
          </span>
          {deck.creator?.displayName ? (
            <span>{deck.creator.displayName}</span>
          ) : null}
          {deck.forkCount !== undefined ? (
            <span>
              {deck.forkCount} {deck.forkCount === 1 ? 'fork' : 'forks'}
            </span>
          ) : null}
          <Badge variant='outline'>{deck.visibility.toLowerCase()}</Badge>
          {deck.level ? <Badge variant='secondary'>{deck.level}</Badge> : null}
          {deck.tags.map((tag) => (
            <Badge key={tag} variant='outline'>
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={copyLink}
          aria-label='Copy deck link'
          className='gap-1.5'
        >
          <Copy className='h-3.5 w-3.5' />
          <span>Share</span>
        </Button>
        {isOwner ? (
          <>
            <ExportDeckButton deckId={deck.id} />
            <ImportDialog
              onConfirm={async (importId, cards) => {
                await importFlashcardsAction({
                  deckId: deck.id,
                  importId,
                  cards,
                })

                return true
              }}
            />
            <Button asChild size='sm' className='gap-1.5'>
              <Link href={ROUTES.vocabDeckEdit(deck.id)}>
                <Pencil className='h-3.5 w-3.5' />
                <span>Edit deck</span>
              </Link>
            </Button>
          </>
        ) : isAuthenticated ? (
          <ForkDeckButton deckId={deck.id} deckTitle={deck.title} />
        ) : (
          <Button asChild variant='outline' size='sm'>
            <Link href={ROUTES.signIn}>Sign in to fork</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
