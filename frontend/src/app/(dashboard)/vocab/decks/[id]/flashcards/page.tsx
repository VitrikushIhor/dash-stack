import type { Metadata } from 'next'
import { PageErrorHandler } from '@/shared/ui/error-state'
import { getDeckQuery } from '@/entities/deck/server'
import { getStudyCardsQuery } from '@/entities/vocab/server'
import { FlashcardsView } from '@/views/vocab'

export const metadata: Metadata = {
  title: 'Flashcards | Dash English Vocabulary',
  description: 'Study vocabulary flashcards with spaced repetition.',
}

export default async function FlashcardsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [deckResult, cardsResult] = await Promise.all([
    getDeckQuery(id),
    getStudyCardsQuery({ deckId: id, mode: 'flashcards' }),
  ])

  if (!deckResult.ok) {
    return <PageErrorHandler error={deckResult.error} withContainer={false} />
  }

  if (!cardsResult.ok) {
    return <PageErrorHandler error={cardsResult.error} withContainer={false} />
  }

  return (
    <FlashcardsView deck={deckResult.data} initialCards={cardsResult.data} />
  )
}
