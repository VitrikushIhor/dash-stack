import { QUERY_KEYS } from '@/shared/api'

export const vocabKeys = {
  all: [QUERY_KEYS.VOCAB] as const,
  dueReviews: () => [...vocabKeys.all, 'due-reviews'] as const,
  dueReviewsForDeck: (deckId: string) =>
    [...vocabKeys.dueReviews(), deckId] as const,
}
