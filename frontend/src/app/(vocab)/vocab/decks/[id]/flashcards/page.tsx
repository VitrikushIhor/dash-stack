import type { Metadata } from 'next'
import { PageErrorHandler } from '@/shared/ui/error-state'
import { VocabFlashcards } from '@/widgets/vocab-flashcards'
import {
  type StudyRouteProps,
  getStudyRouteData,
  getStudySessionKey,
} from '@/views/vocab/server'

export const metadata: Metadata = {
  title: 'Flashcards',
  description: 'Study vocabulary flashcards with spaced repetition.',
}

export default async function FlashcardsPage(props: StudyRouteProps) {
  const route = await getStudyRouteData({ ...props, mode: 'flashcards' })

  if (!route.deck.ok) {
    return <PageErrorHandler error={route.deck.error} withContainer={false} />
  }

  if (!route.cards.ok) {
    return <PageErrorHandler error={route.cards.error} withContainer={false} />
  }

  return (
    <VocabFlashcards
      key={getStudySessionKey(route.deck.data.id, route.mode, route.filters)}
      deck={route.deck.data}
      initialCards={route.cards.data}
    />
  )
}
