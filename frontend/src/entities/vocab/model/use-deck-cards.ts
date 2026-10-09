'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { type InfiniteData, useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '@/shared/lib'
import { vocabKeys } from '../api/vocab-query-keys'
import { type DeckCardsPage } from './types'
import { useDeckCardStarCache } from './use-deck-card-star-cache'
import { useDeckCardsQuery } from './use-deck-cards-query'

const SEARCH_DEBOUNCE_MS = 300

export function useDeckCards(
  deckId: string,
  search: string,
  initialPage: DeckCardsPage
) {
  const debouncedSearch = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS)
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.setQueryData(
      vocabKeys.deckCards(deckId, ''),
      (existing: InfiniteData<DeckCardsPage, number> | undefined) => {
        if (!existing || existing.pages.length === 0) {
          return {
            pages: [initialPage],
            pageParams: [1],
          }
        }
        const updatedPages = [...existing.pages]
        updatedPages[0] = initialPage
        return {
          ...existing,
          pages: updatedPages,
        }
      }
    )
  }, [deckId, initialPage, queryClient])

  const query = useDeckCardsQuery(deckId, debouncedSearch, initialPage)

  const invalidateDeckCards = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: vocabKeys.deckCardsForDeck(deckId),
      }),
    [deckId, queryClient]
  )

  const setCardStarred = useDeckCardStarCache(deckId)

  const pages = query.data?.pages
  const cards = useMemo(
    () => pages?.flatMap((page) => page.data) ?? [],
    [pages]
  )

  return {
    cards,
    meta: pages?.at(-1)?.meta ?? initialPage.meta,
    summary: pages?.[0]?.summary ?? initialPage.summary,
    debouncedSearch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetch: query.refetch,
    error: query.error,
    isError: query.isError && !query.isFetchNextPageError,
    isNextPageError: query.isFetchNextPageError,
    retrySearch: query.refetch,
    retryNextPage: query.fetchNextPage,
    invalidateDeckCards,
    setCardStarred,
    isSearchPending: search.trim() !== debouncedSearch || query.isPending,
  }
}
