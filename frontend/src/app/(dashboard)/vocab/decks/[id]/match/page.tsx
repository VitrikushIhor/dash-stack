import type { Metadata } from 'next'
import { PageErrorHandler } from '@/shared/ui/error-state'
import { getDeckQuery } from '@/entities/deck/server'
import { getStudyCardsQuery } from '@/entities/vocab/server'
import { MatchView } from '@/views/vocab'

export const metadata: Metadata = {
  title: 'Match Game | Dash English Vocabulary',
  description: 'Test your vocabulary recall speed with a matching challenge.',
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [deckResult, cardsResult] = await Promise.all([
    getDeckQuery(id),
    getStudyCardsQuery({ deckId: id, mode: 'match' }),
  ])

  if (!deckResult.ok) {
    return <PageErrorHandler error={deckResult.error} withContainer={false} />
  }

  if (!cardsResult.ok) {
    return <PageErrorHandler error={cardsResult.error} withContainer={false} />
  }

  return <MatchView deck={deckResult.data} initialCards={cardsResult.data} />
}
