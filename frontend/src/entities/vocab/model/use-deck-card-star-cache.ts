import { useCallback } from 'react'
import { type InfiniteData, useQueryClient } from '@tanstack/react-query'
import { vocabKeys } from '../api/vocab-query-keys'
import { type DeckCardsPage } from './types'

export function useDeckCardStarCache(deckId: string) {
  const queryClient = useQueryClient()

  return useCallback(
    (cardId: string, isStarred: boolean) => {
      const cachedPages = queryClient.getQueriesData<InfiniteData<DeckCardsPage>>({
        queryKey: vocabKeys.deckCardsForDeck(deckId),
      })
      const cardToUpdate = cachedPages
        .flatMap(([, cached]) => cached?.pages ?? [])
        .flatMap((page) => page.data)
        .find((card) => card.id === cardId && card.progress.isStarred !== isStarred)
      if (!cardToUpdate) return

      const starredDelta = isStarred ? 1 : -1
      const dueAndStarredDelta =
        cardToUpdate.progress.nextReviewAt !== null &&
        new Date(cardToUpdate.progress.nextReviewAt).getTime() <= Date.now()
          ? starredDelta
          : 0
      queryClient.setQueriesData<InfiniteData<DeckCardsPage>>(
        { queryKey: vocabKeys.deckCardsForDeck(deckId) },
        (cached) => {
          if (!cached) return cached
          return {
            ...cached,
            pages: cached.pages.map((page) => ({
              ...page,
              data: page.data.map((card) =>
                card.id === cardId
                  ? { ...card, progress: { ...card.progress, isStarred } }
                  : card
              ),
              summary: {
                ...page.summary,
                starred: page.summary.starred + starredDelta,
                dueAndStarred: page.summary.dueAndStarred + dueAndStarredDelta,
              },
            })),
          }
        }
      )
    },
    [deckId, queryClient]
  )
}
