import type { Metadata } from 'next'
import { PageErrorHandler } from '@/shared/ui/error-state'
import { getDeckQuery } from '@/entities/deck/server'
import { getStudyCardsQuery } from '@/entities/vocab/server'
import { LearnView } from '@/views/vocab'

export const metadata: Metadata = {
  title: 'Learn Mode',
  description:
    'Master vocabulary with adaptive questions and spaced repetition.',
}

export default async function LearnPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [deckResult, cardsResult] = await Promise.all([
    getDeckQuery(id),
    getStudyCardsQuery({ deckId: id, mode: 'learn' }),
  ])

  if (!deckResult.ok) {
    return <PageErrorHandler error={deckResult.error} withContainer={false} />
  }
  if (!cardsResult.ok) {
    return <PageErrorHandler error={cardsResult.error} withContainer={false} />
  }

  return <LearnView deck={deckResult.data} initialCards={cardsResult.data} />
}
