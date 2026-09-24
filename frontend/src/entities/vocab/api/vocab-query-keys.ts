import { QUERY_KEYS } from '@/shared/api'

export const vocabKeys = {
  all: [QUERY_KEYS.VOCAB] as const,
  dueReviews: () => [...vocabKeys.all, 'due-reviews'] as const,
  dueReviewsForDeck: (deckId: string) =>
    [...vocabKeys.dueReviews(), deckId] as const,
  deckCardsForDeck: (deckId: string) =>
    [...vocabKeys.all, 'deck-cards', deckId] as const,
  deckCards: (deckId: string, search: string) =>
    [...vocabKeys.deckCardsForDeck(deckId), search] as const,
  leaderboard: (deckId: string, page = 1, perPage = 10) =>
    [...vocabKeys.all, 'leaderboard', deckId, page, perPage] as const,
}
