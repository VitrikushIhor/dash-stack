import { createSerializer } from 'nuqs/server'
import { ROUTES } from '@/shared/config'
import { StudyMode } from '@/entities/vocab'
import { studySearchParams } from '@/features/study-vocab/server'

type DeckStudyMode =
  typeof StudyMode.FLASHCARDS | typeof StudyMode.LEARN | typeof StudyMode.MATCH

const serializeStudyFilters = createSerializer(studySearchParams)

const modeRoutes = {
  [StudyMode.FLASHCARDS]: ROUTES.vocabDeckStudy,
  [StudyMode.LEARN]: ROUTES.vocabDeckLearn,
  [StudyMode.MATCH]: ROUTES.vocabMatch,
} satisfies Record<DeckStudyMode, (deckId: string) => string>

export function getStudySessionHref(
  deckId: string,
  mode: DeckStudyMode,
  filters: { onlyDue: boolean; onlyStarred: boolean }
) {
  return serializeStudyFilters(modeRoutes[mode](deckId), filters)
}
