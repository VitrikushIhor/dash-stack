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

export const MatchTileSide = {
  TERM: 'TERM',
  DEFINITION: 'DEFINITION',
} as const;

export type MatchTileSide = (typeof MatchTileSide)[keyof typeof MatchTileSide];

export type RecordMatchPairCommand = CompleteMatchSessionCommand & {
  attemptId: string;
  first: { cardId: string; side: MatchTileSide };
  second: { cardId: string; side: MatchTileSide };
};
