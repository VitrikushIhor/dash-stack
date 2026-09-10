import type { Metadata } from 'next'
import { PageErrorHandler } from '@/shared/ui/error-state'
import { VocabLearn } from '@/widgets/vocab-learn'
import {
  type StudyRouteProps,
  getStudyRouteData,
  getStudySessionKey,
} from '@/views/vocab/server'

export const metadata: Metadata = {
  title: 'Learn Mode',
  description:
    'Master vocabulary with adaptive questions and spaced repetition.',
}

export default async function LearnPage(props: StudyRouteProps) {
  const route = await getStudyRouteData({ ...props, mode: 'learn' })

  if (!route.deck.ok) {
    return <PageErrorHandler error={route.deck.error} withContainer={false} />
  }

  if (!route.cards.ok) {
    return <PageErrorHandler error={route.cards.error} withContainer={false} />
  }

  return (
    <VocabLearn
      key={getStudySessionKey(route.deck.data.id, route.mode, route.filters)}
      deck={route.deck.data}
      initialCards={route.cards.data}
    />
  )
}
