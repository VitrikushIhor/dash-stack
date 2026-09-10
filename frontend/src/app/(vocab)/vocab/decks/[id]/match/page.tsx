import type { Metadata } from 'next'
import { PageErrorHandler } from '@/shared/ui/error-state'
import { MIN_MATCH_CARDS, StudyEmptyState } from '@/features/study-vocab'
import { VocabMatch } from '@/widgets/vocab-match'
import {
  type StudyRouteProps,
  getStudyRouteData,
  getStudySessionKey,
} from '@/views/vocab/server'

export const metadata: Metadata = {
  title: 'Match Game',
  description: 'Test your vocabulary recall speed with a matching challenge.',
}

export default async function MatchPage(props: StudyRouteProps) {
  const route = await getStudyRouteData({ ...props, mode: 'match' })

  if (!route.deck.ok) {
    return <PageErrorHandler error={route.deck.error} withContainer={false} />
  }

  if (!route.cards.ok) {
    return <PageErrorHandler error={route.cards.error} withContainer={false} />
  }

  if (route.cards.data.length === 0) {
    return (
      <StudyEmptyState
        title='No cards match these filters'
        description='Try All cards or change the study filters. Unseen cards are not due until you review them.'
      />
    )
  }

  if (route.cards.data.length < MIN_MATCH_CARDS) {
    return (
      <StudyEmptyState
        title='Not enough cards for Match'
        description='Match needs at least six cards. Change the filters or use Flashcards to review this selection.'
      />
    )
  }

  return (
    <VocabMatch
      key={getStudySessionKey(route.deck.data.id, route.mode, route.filters)}
      deck={route.deck.data}
      filters={route.filters}
    />
  )
}
