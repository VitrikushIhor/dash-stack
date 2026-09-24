import { Prisma } from '@prisma/client';
import { MatchRepositoryPort } from '../../application/ports/match-repository.port';
import {
  MatchCardReadModel,
  MatchLeaderboardEntryReadModel,
} from '../../application/read-models/match.read-model';
import { GetMatchLeaderboardQuery } from '../../application/queries/get-match-leaderboard.query';
import { MatchResult, MatchSession } from '../../domain/entities/match-session.entity';
import { InvalidMatchSessionException } from '../../domain/exceptions/match-domain.exceptions';
import { paginate } from '../../../common/pagination/paginate';
import { OrderDirection } from '../../../common/order/order-direction';
import { mapMatchCardQueryRows } from './match-card-query.mapper';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  avatar: true,
} satisfies Prisma.UserSelect;
type LeaderboardRow = Prisma.DeckLeaderboardGetPayload<{
  include: { user: { select: typeof userSelect } };
}>;
const toEntry = (row: LeaderboardRow): MatchLeaderboardEntryReadModel => ({
  id: row.id,
  deckId: row.deckId,
  userId: row.userId,
  durationMs: row.durationMs,
  cardCount: row.cardCount,
  createdAt: row.createdAt,
  user: {
    id: row.user.id,
    firstName: row.user.firstName,
    lastName: row.user.lastName,
    avatar: row.user.avatar,
  },
});

export class PrismaMatchRepository implements MatchRepositoryPort {
  constructor(private readonly tx: Prisma.TransactionClient) {}

  async selectCards(
    input: Parameters<MatchRepositoryPort['selectCards']>[0],
  ): Promise<MatchCardReadModel[]> {
    const { deckId, userId, onlyDue, onlyStarred, now, limit } = input;
    const dueFilter = onlyDue ? Prisma.sql`AND p."nextReviewAt" <= ${now}` : Prisma.empty;
    const starredFilter = onlyStarred ? Prisma.sql`AND p."isStarred" = true` : Prisma.empty;
    const progressFilter =
      onlyDue || onlyStarred
        ? Prisma.sql`AND EXISTS (
      SELECT 1 FROM "vocab_progress" p WHERE p."flashcardId" = f.id AND p."deckId" = ${deckId}
      AND p."userId" = ${userId}
      ${dueFilter}
      ${starredFilter}
    )`
        : Prisma.empty;
    const rows: unknown = await this.tx.$queryRaw`SELECT f.id, f."deckId", f.term, f.definition
      FROM "flashcards" f WHERE f."deckId" = ${deckId} ${progressFilter}
      ORDER BY random() LIMIT ${limit}`;

    return mapMatchCardQueryRows(rows);
  }

  async createSession(session: MatchSession): Promise<MatchSession> {
    const { deckId, userId, selectedCardIds, startedAt, expiresAt } = session.toSnapshot();
    const row = await this.tx.matchSession.create({
      data: {
        deckId,
        userId,
        startedAt,
        expiresAt,
        cards: {
          create: selectedCardIds.map((flashcardId, position) => ({ flashcardId, position })),
        },
      },
      include: { cards: { orderBy: { position: OrderDirection.asc } } },
    });

    return MatchSession.reconstitute({
      ...row,
      selectedCardIds: row.cards.map((card) => card.flashcardId),
      matchedCardIds: [],
    });
  }

  async findSession(
    input: Parameters<MatchRepositoryPort['findSession']>[0],
  ): Promise<MatchSession | null> {
    const row = await this.tx.matchSession.findFirst({
      where: { id: input.sessionId, deckId: input.deckId, userId: input.userId },
      include: { cards: { orderBy: { position: OrderDirection.asc } } },
    });

    return row
      ? MatchSession.reconstitute({
          ...row,
          selectedCardIds: row.cards.map((card) => card.flashcardId),
          matchedCardIds: row.cards
            .filter((card) => card.matchedAt !== null)
            .map((card) => card.flashcardId),
        })
      : null;
  }

  async recordMatchedPair(
    input: Parameters<MatchRepositoryPort['recordMatchedPair']>[0],
  ): Promise<boolean> {
    const inserted = await this.tx.matchSessionAttempt.createMany({
      data: {
        sessionId: input.sessionId,
        attemptId: input.attemptId,
        payloadHash: input.payloadHash,
        isCorrect: input.isCorrect,
        createdAt: input.matchedAt,
      },
      skipDuplicates: true,
    });

    if (inserted.count === 0) {
      const existing = await this.tx.matchSessionAttempt.findUnique({
        where: {
          sessionId_attemptId: { sessionId: input.sessionId, attemptId: input.attemptId },
        },
      });

      return existing?.payloadHash === input.payloadHash;
    }
    if (!input.isCorrect) {
      const penalized = await this.tx.matchSession.updateMany({
        where: {
          id: input.sessionId,
          deckId: input.deckId,
          userId: input.userId,
          completedAt: null,
          expiresAt: { gt: input.matchedAt },
        },
        data: { penaltyCount: { increment: 1 } },
      });

      return penalized.count === 1;
    }
    if (!input.cardId) return false;
    const updated = await this.tx.matchSessionCard.updateMany({
      where: {
        sessionId: input.sessionId,
        flashcardId: input.cardId,
        matchedAt: null,
        session: {
          deckId: input.deckId,
          userId: input.userId,
          completedAt: null,
          expiresAt: { gt: input.matchedAt },
        },
      },
      data: { matchedAt: input.matchedAt },
    });

    return updated.count === 1;
  }

  async completeSession(session: MatchSession): Promise<boolean> {
    const { id, deckId, userId, completedAt } = session.toSnapshot();

    if (completedAt === null) throw new InvalidMatchSessionException();
    const claimed = await this.tx.matchSession.updateMany({
      where: { id, deckId, userId, completedAt: null, expiresAt: { gt: completedAt } },
      data: { completedAt },
    });

    return claimed.count === 1;
  }

  async findBest(deckId: string, userId: string): Promise<MatchLeaderboardEntryReadModel | null> {
    const row = await this.tx.deckLeaderboard.findUnique({
      where: { deckId_userId: { deckId, userId } },
      include: { user: { select: userSelect } },
    });

    return row ? toEntry(row) : null;
  }

  async saveBest(result: MatchResult): Promise<MatchLeaderboardEntryReadModel> {
    return toEntry(
      await this.tx.deckLeaderboard.upsert({
        where: { deckId_userId: { deckId: result.deckId, userId: result.userId } },
        create: result,
        update: result,
        include: { user: { select: userSelect } },
      }),
    );
  }

  async getLeaderboard(query: GetMatchLeaderboardQuery) {
    const [page, currentUserBest] = await Promise.all([
      paginate<LeaderboardRow, Prisma.DeckLeaderboardFindManyArgs>(
        this.tx.deckLeaderboard,
        {
          where: { deckId: query.deckId },
          include: { user: { select: userSelect } },
          orderBy: [
            { durationMs: OrderDirection.asc },
            { createdAt: OrderDirection.asc },
            { id: OrderDirection.asc },
          ],
        },
        query,
      ),
      query.userId ? this.findBest(query.deckId, query.userId) : Promise.resolve(null),
    ]);

    return { ...page, data: page.data.map(toEntry), currentUserBest };
  }
}
