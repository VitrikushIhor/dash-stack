import { type SearchParams } from 'nuqs/server'
import { StudyMode } from '@/entities/vocab'

export const studyModes = [
  StudyMode.FLASHCARDS,
  StudyMode.LEARN,
  StudyMode.MATCH,
] as const

export type StudyRouteMode = (typeof studyModes)[number]

export type StudyRouteProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParams>
}

export function getStudySessionKey(
  deckId: string,
  mode: StudyRouteMode,
  filters: { onlyDue: boolean; onlyStarred: boolean }
) {
  return `${deckId}:${mode}:${filters.onlyDue}:${filters.onlyStarred}`
}
