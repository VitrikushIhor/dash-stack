import { createSerializer } from 'nuqs/server'
import { ROUTES } from '@/shared/config'
import { studySearchParams } from '@/features/study-vocab/server'

type DeckStudyMode = 'flashcards' | 'learn' | 'match'

const serializeStudyFilters = createSerializer(studySearchParams)

const modeRoutes = {
  flashcards: ROUTES.vocabDeckStudy,
  learn: ROUTES.vocabDeckLearn,
  match: ROUTES.vocabMatch,
} satisfies Record<DeckStudyMode, (deckId: string) => string>

export function getStudySessionHref(
  deckId: string,
  mode: DeckStudyMode,
  filters: { onlyDue: boolean; onlyStarred: boolean }
) {
  return serializeStudyFilters(modeRoutes[mode](deckId), filters)
}
