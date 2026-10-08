'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { vocabApi } from '../api/vocab-api'
import { vocabKeys } from '../api/vocab-query-keys'
import { type DeckCardsPage } from './types'

const CARDS_PER_PAGE = 50

export function useDeckCardsQuery(
  deckId: string,
  search: string,
  initialPage: DeckCardsPage
) {
  return useInfiniteQuery({
    queryKey: vocabKeys.deckCards(deckId, search),
    queryFn: ({ pageParam, signal }) =>
      vocabApi.browseDeckCards(
        deckId,
        { search, page: pageParam, perPage: CARDS_PER_PAGE },
        signal
      ),
    initialPageParam: 1,
    staleTime: 30_000,
    initialData:
      search === '' ? { pages: [initialPage], pageParams: [1] } : undefined,
    getNextPageParam: (lastPage) => lastPage.meta.next ?? undefined,
  })
}
