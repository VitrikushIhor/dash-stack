import { PaginatedResult } from '../../../common/pagination/pagination.models';

export type MatchCardReadModel = {
  id: string;
  deckId: string;
  term: string;
  definition: string;
};

export type MatchSessionReadModel = {
  id: string;
  deckId: string;
  startedAt: Date;
  expiresAt: Date;
  cards: MatchCardReadModel[];
};

export type MatchLeaderboardEntryReadModel = {
  id: string;
  deckId: string;
  userId: string;
  durationMs: number;
  cardCount: number;
  createdAt: Date;
  user: { id: string; firstName: string | null; lastName: string | null; avatar: string | null };
};

export interface MatchLeaderboardReadModel extends PaginatedResult<MatchLeaderboardEntryReadModel> {
  currentUserBest: MatchLeaderboardEntryReadModel | null;
}

export type MatchCompletionReadModel = {
  sessionId: string;
  durationMs: number;
  cardCount: number;
  completedAt: Date;
  bestResult: MatchLeaderboardEntryReadModel;
};
