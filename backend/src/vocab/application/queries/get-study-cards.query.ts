export interface GetStudyCardsQuery {
  userId: string | null;
  deckId: string;
  mode?: 'flashcards' | 'learn' | 'test' | 'match';
  onlyStarred?: boolean;
  onlyDue?: boolean;
}
