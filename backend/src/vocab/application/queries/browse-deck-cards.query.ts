export interface BrowseDeckCardsQuery {
  deckId: string;
  userId: string | null;
  search?: string;
  page: number;
  perPage: number;
}
