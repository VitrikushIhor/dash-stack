import {
  InvalidMatchSessionException,
  MatchSessionAlreadyCompletedException,
  MatchSessionExpiredException,
  MatchSessionIncompleteException,
  MatchSessionNotFoundException,
} from '../exceptions/match-domain.exceptions';

const MATCH_MIN_CARDS = 6;
export const MATCH_MAX_CARDS = 12;
const MATCH_SESSION_TTL_MS = 30 * 60 * 1000;
export const MATCH_PENALTY_MS = 2000;

export type MatchResult = {
  deckId: string;
  userId: string;
  durationMs: number;
  cardCount: number;
  createdAt: Date;
};

type MatchSessionSnapshot = {
  id: string;
  deckId: string;
  userId: string;
  selectedCardIds: string[];
  matchedCardIds?: string[];
  startedAt: Date;
  expiresAt: Date;
  completedAt: Date | null;
  penaltyCount?: number;
};

export class MatchSession {
  private constructor(private readonly props: MatchSessionSnapshot) {
    const { selectedCardIds, matchedCardIds = [], startedAt, expiresAt, completedAt } = props;

    if (
      !props.deckId.trim() ||
      !props.userId.trim() ||
      selectedCardIds.length < MATCH_MIN_CARDS ||
      selectedCardIds.length > MATCH_MAX_CARDS ||
      selectedCardIds.some((id) => !id.trim()) ||
      new Set(selectedCardIds).size !== selectedCardIds.length ||
      new Set(matchedCardIds).size !== matchedCardIds.length ||
      matchedCardIds.some((id) => !selectedCardIds.includes(id)) ||
      !Number.isInteger(props.penaltyCount ?? 0) ||
      (props.penaltyCount ?? 0) < 0 ||
      !Number.isFinite(startedAt.getTime()) ||
      expiresAt.getTime() - startedAt.getTime() !== MATCH_SESSION_TTL_MS ||
      (completedAt !== null &&
        (!Number.isFinite(completedAt.getTime()) ||
          completedAt < startedAt ||
          completedAt >= expiresAt))
    )
      throw new InvalidMatchSessionException();
  }

  static create(
    props: Pick<MatchSessionSnapshot, 'deckId' | 'userId' | 'selectedCardIds'>,
    now: Date,
  ): MatchSession {
    return MatchSession.reconstitute({
      ...props,
      id: '',
      startedAt: now,
      expiresAt: new Date(now.getTime() + MATCH_SESSION_TTL_MS),
      completedAt: null,
      matchedCardIds: [],
      penaltyCount: 0,
    });
  }

  static reconstitute(props: MatchSessionSnapshot): MatchSession {
    return new MatchSession({
      ...props,
      selectedCardIds: [...props.selectedCardIds],
      startedAt: new Date(props.startedAt),
      expiresAt: new Date(props.expiresAt),
      completedAt: props.completedAt === null ? null : new Date(props.completedAt),
    });
  }

  complete(deckId: string, userId: string, now: Date): MatchResult {
    if (deckId !== this.props.deckId || userId !== this.props.userId) {
      throw new MatchSessionNotFoundException();
    }
    if (this.props.completedAt !== null) throw new MatchSessionAlreadyCompletedException();
    if (now >= this.props.expiresAt) throw new MatchSessionExpiredException();
    if ((this.props.matchedCardIds?.length ?? 0) !== this.props.selectedCardIds.length) {
      throw new MatchSessionIncompleteException();
    }
    const durationMs =
      now.getTime() -
      this.props.startedAt.getTime() +
      (this.props.penaltyCount ?? 0) * MATCH_PENALTY_MS;

    if (!Number.isFinite(durationMs) || durationMs < 0) throw new InvalidMatchSessionException();
    this.props.completedAt = new Date(now);

    return {
      deckId: this.props.deckId,
      userId: this.props.userId,
      durationMs,
      cardCount: this.props.selectedCardIds.length,
      createdAt: new Date(now),
    };
  }

  completedResult(deckId: string, userId: string): MatchResult | null {
    if (deckId !== this.props.deckId || userId !== this.props.userId) {
      throw new MatchSessionNotFoundException();
    }
    if (this.props.completedAt === null) return null;

    return {
      deckId: this.props.deckId,
      userId: this.props.userId,
      durationMs:
        this.props.completedAt.getTime() -
        this.props.startedAt.getTime() +
        (this.props.penaltyCount ?? 0) * MATCH_PENALTY_MS,
      cardCount: this.props.selectedCardIds.length,
      createdAt: new Date(this.props.completedAt),
    };
  }

  toSnapshot(): MatchSessionSnapshot {
    return {
      ...this.props,
      selectedCardIds: [...this.props.selectedCardIds],
      matchedCardIds: [...(this.props.matchedCardIds ?? [])],
      startedAt: new Date(this.props.startedAt),
      expiresAt: new Date(this.props.expiresAt),
      completedAt: this.props.completedAt === null ? null : new Date(this.props.completedAt),
    };
  }
}
