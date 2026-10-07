import { PageErrorHandler } from '@/shared/ui/error-state'
import { StudyMode } from '@/entities/vocab'
import {
  MIN_MATCH_CARDS,
  StudyEmptyState,
} from '@/features/study-vocab/session-ui'
import { getStudyRouteData } from '../model/get-study-route-data'
import {
  type StudyRouteMode,
  type StudyRouteProps,
  getStudySessionKey,
} from '../model/study-route'
import { StudyModeContent } from './study-mode-content'

export async function StudyPage(
  props: StudyRouteProps & {
    mode: StudyRouteMode
  }
) {
  const route = await getStudyRouteData(props)

  if (!route.deck.ok) {
    return <PageErrorHandler error={route.deck.error} withContainer={false} />
  }

  const deck = route.deck.data
  const sessionKey = getStudySessionKey(deck.id, route.mode, route.filters)

  if (!route.cards.ok)
    return <PageErrorHandler error={route.cards.error} withContainer={false} />

  if (route.mode === StudyMode.MATCH) {
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
  }

  return (
    <StudyModeContent
      key={sessionKey}
      mode={route.mode}
      deck={deck}
      initialCards={route.cards.data}
      filters={route.filters}
      sessionKey={sessionKey}
    />
  )
}
