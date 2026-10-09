import type { Metadata } from 'next'
import { PageErrorHandler } from '@/shared/ui/error-state'
import { getDeckQuery } from '@/entities/deck/server'
import { DeckEditorView } from '@/views/vocab'

export const metadata: Metadata = {
  title: 'Edit Vocabulary Deck | Dash English',
  description: 'Add, edit, reorder flashcards and attach visual aids.',
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function DeckEditPage({ params }: Props) {
  const { id } = await params

  const deckRes = await getDeckQuery(id)

  if (!deckRes.ok) {
    return <PageErrorHandler error={deckRes.error} />
  }

  const deck = deckRes.data

  return (
    <DeckEditorView
      initialDeck={{
        ...deck,
        flashcards: deck.flashcards ?? [],
      }}
    />
  )
}
