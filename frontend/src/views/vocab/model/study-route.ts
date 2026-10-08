import { type SearchParams } from 'nuqs/server'
import type { Deck } from '@/entities/deck'
import { type StudyCard, StudyMode } from '@/entities/vocab'

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

export interface StudyContentProps {
  deck: Deck
  initialCards: StudyCard[]
  filters: { onlyDue: boolean; onlyStarred: boolean }
  sessionKey: string
}

export function getStudySessionKey(
  deckId: string,
  mode: StudyRouteMode,
  filters: { onlyDue: boolean; onlyStarred: boolean }
) {
  return `${deckId}:${mode}:${filters.onlyDue}:${filters.onlyStarred}`
}

export function isStudyRouteMode(value: string): value is StudyRouteMode {
  return (studyModes as readonly string[]).includes(value)
}
