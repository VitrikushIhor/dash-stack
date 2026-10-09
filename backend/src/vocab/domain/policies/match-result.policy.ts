import { MatchResult } from '../entities/match-session.entity';

export class MatchResultPolicy {
  static isBetter(candidate: MatchResult, current: MatchResult): boolean {
    return (
      candidate.durationMs < current.durationMs ||
      (candidate.durationMs === current.durationMs && candidate.createdAt < current.createdAt)
    );
  }
}
