import {
  InvalidMatchSessionException,
  MatchSessionAlreadyCompletedException,
  MatchSessionExpiredException,
  MatchSessionIncompleteException,
  MatchSessionNotFoundException,
} from '../exceptions/match-domain.exceptions';

export const MATCH_MIN_CARDS = 6;
export const MATCH_MAX_CARDS = 12;
export const MATCH_SESSION_TTL_MS = 30 * 60 * 1000;

export type MatchResult = {
  deckId: string;
  userId: string;
  durationMs: number;
  cardCount: number;
  createdAt: Date;
};

export type MatchSessionSnapshot = {
  id: string;
  deckId: string;
  userId: string;
  selectedCardIds: string[];
  matchedCardIds?: string[];
  startedAt: Date;
  expiresAt: Date;
  completedAt: Date | null;
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
    const durationMs = now.getTime() - this.props.startedAt.getTime();
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
