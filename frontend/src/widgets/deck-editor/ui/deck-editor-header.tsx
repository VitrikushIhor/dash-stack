import React from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Globe, Loader2, Lock, Save } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/core/button'
import {
  DeckLevelBadge,
  DeckStatusBadge,
  DeckStatusEnum,
} from '@/entities/deck'
import { type useDeckEditor } from '../model/use-deck-editor'

interface DeckEditorHeaderProps {
  state: ReturnType<typeof useDeckEditor>
}

export function DeckEditorHeader({ state }: DeckEditorHeaderProps) {
  const {
    deck,
    isSaving,
    handleSaveChanges,
    publishDeck,
    unpublishDeck,
    metadata,
    flashcards,
  } = state

  const isPending = isSaving

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-3'>
        <Button asChild variant='ghost' size='sm' className='gap-1.5 text-xs'>
          <Link href={ROUTES.vocabDecks}>
            <ArrowLeft className='h-4 w-4' />
            <span>My Decks</span>
          </Link>
        </Button>

        <div className='flex items-center gap-2'>
          <DeckLevelBadge level={metadata.level} />
          <DeckStatusBadge status={deck.status} />
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <Button
          asChild
          variant='outline'
          size='sm'
          className='gap-1.5 shadow-sm'
        >
          <Link href={ROUTES.vocabDeckStudy(deck.id)}>
            <BookOpen className='text-primary h-3.5 w-3.5' />
            <span>Study Deck</span>
          </Link>
        </Button>

        {deck.status === DeckStatusEnum.DRAFT ? (
          <Button
            type='button'
            variant='secondary'
            size='sm'
            onClick={() => publishDeck(deck.id)}
            disabled={flashcards.cards.length < 2 || isSaving}
            className='gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400'
          >
            <Globe className='h-3.5 w-3.5' />
            <span>Publish</span>
          </Button>
        ) : (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => unpublishDeck(deck.id)}
            disabled={isSaving}
            className='gap-1.5 text-amber-600'
          >
            <Lock className='h-3.5 w-3.5' />
            <span>Unpublish</span>
          </Button>
        )}

        <Button
          type='button'
          size='sm'
          onClick={handleSaveChanges}
          disabled={isPending}
          className='gap-1.5 shadow-md'
        >
          {isPending ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
          ) : (
            <Save className='h-3.5 w-3.5' />
          )}
          <span>{isPending ? 'Saving...' : 'Save Deck'}</span>
        </Button>
      </div>
    </div>
  )
}
