import React from 'react'
import { type Deck } from '@/entities/deck'
import { DeckEditorForm } from '@/widgets/deck-editor'

interface DeckEditorViewProps {
  initialDeck: Deck
}

export function DeckEditorView({ initialDeck }: DeckEditorViewProps) {
  return (
    <div className='container mx-auto max-w-5xl px-4 py-6 sm:px-6'>
      <DeckEditorForm initialDeck={initialDeck} />
    </div>
  )
}
