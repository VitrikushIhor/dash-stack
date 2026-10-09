'use client'

import { useQuery } from '@tanstack/react-query'
import { vocabApi } from '../api/vocab-api'
import { vocabKeys } from '../api/vocab-query-keys'

interface UseDueReviewsOptions {
  deckId?: string
  enabled?: boolean
}

export function useDueReviews({
  deckId,
  enabled = true,
}: UseDueReviewsOptions = {}) {
  return useQuery({
    queryKey: deckId
      ? vocabKeys.dueReviewsForDeck(deckId)
      : vocabKeys.dueReviews(),
    queryFn: () => vocabApi.getDueReviews(deckId),
    enabled,
  })
}
