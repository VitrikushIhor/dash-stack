import { createSerializer } from 'nuqs/server'
import { ROUTES } from '@/shared/config'
import { studySearchParams } from '@/features/study-vocab/server'
import { type StudyMode } from '../model/study-route'

const serializeStudyFilters = createSerializer(studySearchParams)

const modeRoutes = {
  flashcards: ROUTES.vocabDeckStudy,
  learn: ROUTES.vocabDeckLearn,
  match: ROUTES.vocabMatch,
} satisfies Record<StudyMode, (deckId: string) => string>

export function getStudySessionHref(
  deckId: string,
  mode: StudyMode,
  filters: { onlyDue: boolean; onlyStarred: boolean }
) {
  return serializeStudyFilters(modeRoutes[mode](deckId), filters)
}
