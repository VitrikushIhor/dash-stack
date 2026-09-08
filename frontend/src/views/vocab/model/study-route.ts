import { type SearchParams } from 'nuqs/server'

export const studyModes = ['flashcards', 'learn', 'match'] as const

export type StudyMode = (typeof studyModes)[number]

export type StudyRouteProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParams>
}

export function getStudySessionKey(
  deckId: string,
  mode: StudyMode,
  filters: { onlyDue: boolean; onlyStarred: boolean }
) {
  return `${deckId}:${mode}:${filters.onlyDue}:${filters.onlyStarred}`
}
