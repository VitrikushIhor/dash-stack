import { MatchResult, MatchSession } from '../../domain/entities/match-session.entity';
import { GetMatchLeaderboardQuery } from '../queries/get-match-leaderboard.query';
import {
  MatchCardReadModel,
  MatchLeaderboardEntryReadModel,
  MatchLeaderboardReadModel,
} from '../read-models/match.read-model';

export interface MatchRepositoryPort {
  selectCards(input: {
    deckId: string;
    userId: string;
    onlyDue: boolean;
    onlyStarred: boolean;
    now: Date;
    limit: number;
  }): Promise<MatchCardReadModel[]>;
  createSession(session: MatchSession): Promise<MatchSession>;
  findSession(input: {
    sessionId: string;
    deckId: string;
    userId: string;
  }): Promise<MatchSession | null>;
  completeSession(session: MatchSession): Promise<boolean>;
  recordMatchedPair(input: {
    sessionId: string;
    deckId: string;
    userId: string;
    attemptId: string;
    payloadHash: string;
    cardId: string | null;
    isCorrect: boolean;
    matchedAt: Date;
  }): Promise<boolean>;
  findBest(deckId: string, userId: string): Promise<MatchLeaderboardEntryReadModel | null>;
  saveBest(result: MatchResult): Promise<MatchLeaderboardEntryReadModel>;
  getLeaderboard(query: GetMatchLeaderboardQuery): Promise<MatchLeaderboardReadModel>;
}
