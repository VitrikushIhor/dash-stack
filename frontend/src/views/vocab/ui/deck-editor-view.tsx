import React from 'react'
import { notFound } from 'next/navigation'
import { type Deck } from '@/entities/deck'
import { requireAuthenticatedUser } from '@/entities/user/server'
import { DeckEditorForm } from '@/widgets/deck-editor'

interface DeckEditorViewProps {
  initialDeck: Deck
}

export async function DeckEditorView({ initialDeck }: DeckEditorViewProps) {
  const user = await requireAuthenticatedUser()
  if (user.id !== initialDeck.ownerUserId) notFound()
  return (
    <div className='container mx-auto max-w-5xl px-4 py-6 sm:px-6'>
      <DeckEditorForm
        key={`${user.id}:${initialDeck.id}`}
        initialDeck={initialDeck}
      />
    </div>
  )
}
