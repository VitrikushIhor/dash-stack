import Link from 'next/link'
import { createSerializer } from 'nuqs/server'
import { ROUTES } from '@/shared/config'
import { PageErrorHandler } from '@/shared/ui/error-state'
import { StudyMode } from '@/entities/vocab'
import {
  MIN_MATCH_CARDS,
  StudyEmptyState,
  StudyFilters,
} from '@/features/study-vocab'
import { studySearchParams } from '@/features/study-vocab/server'
import { VocabFlashcards } from '@/widgets/vocab-flashcards'
import { VocabLearn } from '@/widgets/vocab-learn'
import { VocabMatch } from '@/widgets/vocab-match'
import { getStudyRouteData } from '../model/get-study-route-data'
import {
  type StudyRouteMode,
  type StudyRouteProps,
  getStudySessionKey,
} from '../model/study-route'

const serializeFilters = createSerializer(studySearchParams)

export async function StudyPage(
  props: StudyRouteProps & { mode: StudyRouteMode }
) {
  const route = await getStudyRouteData(props)

  if (!route.deck.ok) {
    return <PageErrorHandler error={route.deck.error} withContainer={false} />
  }

  const deck = route.deck.data
  const sessionKey = getStudySessionKey(deck.id, route.mode, route.filters)

  const content = () => {
    if (!route.cards.ok)
      return (
        <PageErrorHandler error={route.cards.error} withContainer={false} />
      )

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

    if (route.cards.data.length === 0) {
      return (
        <StudyEmptyState
          title='No cards match these filters'
          description='Try All cards or change the study filters. Unseen cards are not due until you review them.'
        />
      )
    }

    if (route.cards.data.length < MIN_MATCH_CARDS)
      return (
        <StudyEmptyState
          title='Not enough cards for Match'
          description='Match needs at least six cards. Change the filters or use Flashcards to review this selection.'
        />
      )

    return <VocabMatch key={sessionKey} deck={deck} filters={route.filters} />
  }

  return (
    <>
      <div className='mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3'>
        <nav aria-label='Study modes' className='flex gap-4 text-sm'>
          <Link
            href={serializeFilters(
              ROUTES.vocabDeckStudy(deck.id),
              route.filters
            )}
            aria-current={
              route.mode === StudyMode.FLASHCARDS ? 'page' : undefined
            }
          >
            Flashcards
          </Link>
          <Link
            href={serializeFilters(
              ROUTES.vocabDeckLearn(deck.id),
              route.filters
            )}
            aria-current={route.mode === StudyMode.LEARN ? 'page' : undefined}
          >
            Learn
          </Link>
          <Link
            href={serializeFilters(ROUTES.vocabMatch(deck.id), route.filters)}
            aria-current={route.mode === StudyMode.MATCH ? 'page' : undefined}
          >
            Match
          </Link>
        </nav>
        <StudyFilters />
      </div>
      {content()}
    </>
  )
}
