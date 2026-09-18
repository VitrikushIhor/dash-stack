import 'server-only'
import { getDeckQuery } from '@/entities/deck/server'
import { getStudyCardsQuery } from '@/entities/vocab/server'
import { studySearchParamsCache } from '@/features/study-vocab/server'
import { type StudyRouteMode, type StudyRouteProps } from './study-route'

export async function getStudyRouteData({
  mode,
  params,
  searchParams,
}: StudyRouteProps & { mode: StudyRouteMode }) {
  const { id } = await params
  const filters = await studySearchParamsCache.parse(searchParams)
  const [deck, cards] = await Promise.all([
    getDeckQuery(id),
    getStudyCardsQuery({ deckId: id, mode, ...filters }),
  ])

  return { mode, filters, deck, cards }
}
