'use client'

import React from 'react'
import Link from 'next/link'
import {
  Archive,
  BookOpen,
  Edit3,
  Globe,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { ROUTES } from '@/shared/config'
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/ui/core/dropdown-menu'
import { type Deck, DeckStatusEnum } from '@/entities/deck'
import { ExportDeckMenuItems } from '@/features/export-flashcards'
import { useDeckActions, useDeckSearchParams } from '@/features/manage-deck'

interface MyDeckCardActionsProps {
  deck: Deck
}

export function MyDeckCardActions({ deck }: MyDeckCardActionsProps) {
  const { publishDeck, unpublishDeck, archiveDeck, restoreDeck } =
    useDeckActions()
  const [, setParams] = useDeckSearchParams()

  const handleDeleteClick = () => {
    setParams({ 'delete-deck': deck.id })
  }

  return (
    <>
      <DropdownMenuItem asChild>
        <Link
          href={ROUTES.vocabDeck(deck.id)}
          className='flex items-center gap-2'
        >
          <BookOpen className='text-primary h-4 w-4' />
          <span>Open Deck</span>
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild>
        <Link
          href={ROUTES.vocabDeckEdit(deck.id)}
          className='flex items-center gap-2'
        >
          <Edit3 className='h-4 w-4 text-blue-500' />
          <span>Edit Deck</span>
        </Link>
      </DropdownMenuItem>

      <ExportDeckMenuItems deckId={deck.id} />
      <DropdownMenuSeparator />

      {deck.status === DeckStatusEnum.DRAFT && (
        <DropdownMenuItem
          onClick={() => publishDeck(deck.id)}
          className='flex items-center gap-2 text-emerald-600'
        >
          <Globe className='h-4 w-4' />
          <span>Publish Deck</span>
        </DropdownMenuItem>
      )}

      {deck.status === DeckStatusEnum.PUBLISHED && (
        <DropdownMenuItem
          onClick={() => unpublishDeck(deck.id)}
          className='flex items-center gap-2 text-amber-600'
        >
          <Globe className='h-4 w-4' />
          <span>Unpublish to Draft</span>
        </DropdownMenuItem>
      )}

      {deck.status !== DeckStatusEnum.ARCHIVED && (
        <DropdownMenuItem
          onClick={() => archiveDeck(deck.id)}
          className='flex items-center gap-2 text-amber-600'
        >
          <Archive className='h-4 w-4' />
          <span>Archive</span>
        </DropdownMenuItem>
      )}

      {deck.status === DeckStatusEnum.ARCHIVED && (
        <DropdownMenuItem
          onClick={() => restoreDeck(deck.id)}
          className='flex items-center gap-2 text-blue-600'
        >
          <RotateCcw className='h-4 w-4' />
          <span>Restore to Draft</span>
        </DropdownMenuItem>
      )}

      <DropdownMenuItem
        onClick={handleDeleteClick}
        className='text-destructive focus:text-destructive flex items-center gap-2'
      >
        <Trash2 className='h-4 w-4' />
        <span>Delete</span>
      </DropdownMenuItem>
    </>
  )
}
