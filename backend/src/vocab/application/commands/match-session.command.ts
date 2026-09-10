export type CreateMatchSessionCommand = {
  deckId: string;
  userId?: string | null;
  onlyDue?: boolean;
  onlyStarred?: boolean;
};

export type CompleteMatchSessionCommand = {
  deckId: string;
  userId?: string | null;
  sessionId: string;
};

export type RecordMatchPairCommand = CompleteMatchSessionCommand & { cardId: string };
