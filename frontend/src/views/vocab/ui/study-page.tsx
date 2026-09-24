import { PageErrorHandler } from '@/shared/ui/error-state'
import { StudyMode } from '@/entities/vocab'
import { MIN_MATCH_CARDS, StudyEmptyState } from '@/features/study-vocab'
import { VocabFlashcards } from '@/widgets/vocab-flashcards'
import { VocabLearn } from '@/widgets/vocab-learn'
import { VocabMatch } from '@/widgets/vocab-match'
import { getStudyRouteData } from '../model/get-study-route-data'
import {
  type StudyRouteMode,
  type StudyRouteProps,
  getStudySessionKey,
} from '../model/study-route'

export async function StudyPage(
  props: StudyRouteProps & { mode: StudyRouteMode }
) {
  const route = await getStudyRouteData(props)

  if (!route.deck.ok) {
    return <PageErrorHandler error={route.deck.error} withContainer={false} />
  }

  const deck = route.deck.data
  const sessionKey = getStudySessionKey(deck.id, route.mode, route.filters)

  if (!route.cards.ok)
    return <PageErrorHandler error={route.cards.error} withContainer={false} />

  if (route.mode === StudyMode.FLASHCARDS)
    return (
      <VocabFlashcards
        key={sessionKey}
        deck={deck}
        initialCards={route.cards.data}
      />
    )

  if (route.mode === StudyMode.LEARN)
    return (
      <VocabLearn
        key={sessionKey}
        deck={deck}
        initialCards={route.cards.data}
        sessionKey={sessionKey}
      />
    )

  if (route.cards.data.length === 0)
    return (
      <StudyEmptyState
        title='No cards match these filters'
        description='Try All cards or change the study filters. Unseen cards are not due until you review them.'
      />
    )

  if (route.cards.data.length < MIN_MATCH_CARDS)
    return (
      <StudyEmptyState
        title='Not enough cards for Match'
        description='Match needs at least six cards. Change the filters or use Flashcards to review this selection.'
      />
    )

  return (
    <VocabMatch
      key={sessionKey}
      deck={deck}
      filters={route.filters}
      initialCards={route.cards.data}
    />
  )
}
