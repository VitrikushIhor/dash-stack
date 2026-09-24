export interface DeckDueReviewsReadModel {
  deckId: string;
  deckTitle: string;
  dueCount: number;
}

export interface DueReviewsReadModel {
  totalDue: number;
  perDeck: DeckDueReviewsReadModel[];
}
