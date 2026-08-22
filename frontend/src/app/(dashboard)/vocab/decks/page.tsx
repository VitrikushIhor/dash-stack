import type { Metadata } from 'next'
import { PageErrorHandler } from '@/shared/ui/error-state'
import { getMyDecksQuery } from '@/entities/deck/server'
import { MyDecksView } from '@/views/vocab'

export const metadata: Metadata = {
  title: 'My Decks | Dash English Vocabulary',
  description:
    'Manage and study your custom vocabulary flashcards with spaced repetition.',
}

export default async function MyDecksPage() {
  const result = await getMyDecksQuery()

  if (!result.ok) {
    return <PageErrorHandler error={result.error} withContainer={false} />
  }

  return <MyDecksView initialDecks={result.data} />
}
