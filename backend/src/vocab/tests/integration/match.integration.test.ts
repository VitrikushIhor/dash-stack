import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaService } from 'nestjs-prisma';
import { PrismaMatchTransaction } from '../../infrastructure/persistence/prisma-match-transaction';
import { CreateMatchSessionUseCase } from '../../application/use-cases/create-match-session.use-case';
import { CompleteMatchSessionUseCase } from '../../application/use-cases/complete-match-session.use-case';
import { GetMatchLeaderboardUseCase } from '../../application/use-cases/get-match-leaderboard.use-case';
import {
  InvalidMatchSessionException,
  MatchSessionAlreadyCompletedException,
} from '../../domain/exceptions/match-domain.exceptions';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for Match integration tests');

describe('Match persistence integration', () => {
  let pool: Pool;
  let prisma: PrismaService;
  let create: CreateMatchSessionUseCase;
  let complete: CompleteMatchSessionUseCase;
  let leaderboard: GetMatchLeaderboardUseCase;
  let userId: string;
  let extraUserIds: string[];
  let now: Date;
  const startedAt = new Date('2026-09-09T10:00:00.000Z');
  const createDeck = (count: number) =>
    prisma.deck.create({
      data: {
        ownerUserId: userId,
        title: 'Match integration',
        flashcards: {
          create: Array.from({ length: count }, (_, position) => ({
            term: `Term ${position}`,
            definition: `Definition ${position}`,
            position,
          })),
        },
      },
    });

  beforeAll(() => {
    pool = new Pool({ connectionString: databaseUrl });
    prisma = new PrismaService({ prismaOptions: { adapter: new PrismaPg(pool) } });
    const transaction = new PrismaMatchTransaction(prisma);
    const clock = { now: () => new Date(now) };
    create = new CreateMatchSessionUseCase(transaction, clock);
    complete = new CompleteMatchSessionUseCase(transaction, clock);
    leaderboard = new GetMatchLeaderboardUseCase(transaction);
  });
  beforeEach(async () => {
    now = startedAt;
    extraUserIds = [];
    userId = `match-integration-${randomUUID()}`;
    await prisma.user.create({
      data: { id: userId, email: `${userId}@example.test`, firstName: 'Match learner' },
    });
  });
  afterEach(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [userId, ...extraUserIds] } } });
  });
  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it.each([0, 5, 6, 8, 12, 30])(
    'should_select_valid_server_cards_when_deck_has_%i_cards',
    async (count) => {
      const deck = await createDeck(count);
      const pending = create.execute({ deckId: deck.id, userId });
      if (count < 6) {
        await expect(pending).rejects.toThrow(InvalidMatchSessionException);
        expect(await prisma.matchSession.count({ where: { deckId: deck.id } })).toBe(0);
      } else {
        const session = await pending;
        const stored = await prisma.matchSession.findUniqueOrThrow({
          where: { id: session.id },
          include: { cards: { orderBy: { position: 'asc' } } },
        });
        expect(session.cards).toHaveLength(Math.min(count, 12));
        expect(new Set(session.cards.map((card) => card.id)).size).toBe(session.cards.length);
        expect(stored.cards.map((card) => card.flashcardId)).toEqual(
          session.cards.map((card) => card.id),
        );
        expect(stored.expiresAt.getTime() - stored.startedAt.getTime()).toBe(1800000);
      }
    },
  );

  it('should_accept_one_completion_when_requests_run_concurrently', async () => {
    const deck = await createDeck(12);
    const session = await create.execute({ deckId: deck.id, userId });
    await prisma.matchSessionCard.updateMany({
      where: { sessionId: session.id },
      data: { matchedAt: now },
    });
    now = new Date(startedAt.getTime() + 14500);
    const command = { deckId: deck.id, userId, sessionId: session.id };

    const outcomes = await Promise.allSettled([
      complete.execute(command),
      complete.execute(command),
      complete.execute(command),
    ]);

    expect(outcomes.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    for (const outcome of outcomes) {
      if (outcome.status === 'rejected')
        expect(outcome.reason).toBeInstanceOf(MatchSessionAlreadyCompletedException);
    }
    expect(await prisma.deckLeaderboard.count({ where: { deckId: deck.id } })).toBe(1);
    expect(
      await prisma.deckLeaderboard.findFirstOrThrow({ where: { deckId: deck.id } }),
    ).toMatchObject({ durationMs: 14500, cardCount: 12, createdAt: now });
  });

  it('should_keep_one_best_result_when_different_sessions_complete_concurrently', async () => {
    const deck = await createDeck(6);
    const slow = await create.execute({ deckId: deck.id, userId });
    now = new Date(startedAt.getTime() + 1000);
    const fast = await create.execute({ deckId: deck.id, userId });
    await prisma.matchSessionCard.updateMany({
      where: { sessionId: { in: [slow.id, fast.id] } },
      data: { matchedAt: now },
    });
    now = new Date(startedAt.getTime() + 15000);

    await Promise.all(
      [slow, fast].map((session) =>
        complete.execute({ deckId: deck.id, userId, sessionId: session.id }),
      ),
    );

    const result = await leaderboard.execute({ deckId: deck.id, userId, page: 1, perPage: 10 });
    expect(result.meta.total).toBe(1);
    expect(result.data[0]).toMatchObject({
      userId,
      durationMs: 14000,
      user: { firstName: 'Match learner' },
    });
    expect(result.currentUserBest).toEqual(result.data[0]);
    expect(
      await prisma.matchSession.count({ where: { deckId: deck.id, completedAt: { not: null } } }),
    ).toBe(2);
  });

  it('should_roll_back_completion_when_result_write_violates_a_constraint', async () => {
    const deck = await createDeck(6);
    const created = await create.execute({ deckId: deck.id, userId });
    await prisma.matchSessionCard.updateMany({
      where: { sessionId: created.id },
      data: { matchedAt: startedAt },
    });
    const transaction = new PrismaMatchTransaction(prisma);

    await expect(
      transaction.run(async ({ matchRepository }) => {
        const session = await matchRepository.findSession({
          sessionId: created.id,
          deckId: deck.id,
          userId,
        });
        if (!session) throw new Error('Fixture session missing');
        const result = session.complete(deck.id, userId, new Date(startedAt.getTime() + 1000));
        await matchRepository.completeSession(session);
        await matchRepository.saveBest({ ...result, cardCount: 13 });
      }),
    ).rejects.toThrow();

    expect(
      (await prisma.matchSession.findUniqueOrThrow({ where: { id: created.id } })).completedAt,
    ).toBeNull();
    expect(await prisma.deckLeaderboard.count({ where: { deckId: deck.id } })).toBe(0);
  });

  it('should_select_only_existing_due_and_starred_progress_when_filters_are_combined', async () => {
    const deck = await createDeck(14);
    const cards = await prisma.flashcard.findMany({
      where: { deckId: deck.id },
      orderBy: { position: 'asc' },
    });
    await prisma.vocabProgress.createMany({
      data: cards.slice(0, 8).map((card, index) => ({
        userId,
        deckId: deck.id,
        flashcardId: card.id,
        isStarred: index < 7,
        nextReviewAt: index === 6 ? new Date(startedAt.getTime() + 1) : startedAt,
      })),
    });

    const session = await create.execute({
      deckId: deck.id,
      userId,
      onlyDue: true,
      onlyStarred: true,
    });

    expect(session.cards.map((card) => card.id).sort()).toEqual(
      cards
        .slice(0, 6)
        .map((card) => card.id)
        .sort(),
    );
  });

  it('should_allow_card_deletion_and_invalidate_the_active_session', async () => {
    const deck = await createDeck(6);
    const session = await create.execute({ deckId: deck.id, userId });
    const card = await prisma.matchSessionCard.findFirstOrThrow({
      where: { sessionId: session.id },
    });

    await expect(
      prisma.flashcard.delete({ where: { id: card.flashcardId } }),
    ).resolves.toBeDefined();
    expect(await prisma.matchSessionCard.count({ where: { sessionId: session.id } })).toBe(5);
    await expect(
      complete.execute({ deckId: deck.id, userId, sessionId: session.id }),
    ).rejects.toThrow();
  });

  it('should_paginate_stable_rankings_and_return_best_outside_page_when_results_tie', async () => {
    const deck = await createDeck(6);
    for (let index = 0; index < 3; index += 1) {
      const id = `match-integration-${randomUUID()}`;
      extraUserIds.push(id);
      await prisma.user.create({ data: { id, email: `${id}@example.test` } });
    }
    const orderedUserIds = [extraUserIds[0], userId, extraUserIds[1], extraUserIds[2]];
    await prisma.deckLeaderboard.createMany({
      data: orderedUserIds.map((id, index) => ({
        id: `${deck.id}-${index}`,
        userId: id,
        deckId: deck.id,
        cardCount: 6,
        durationMs: index === 0 ? 1000 : 2000,
        createdAt: new Date(startedAt.getTime() + (index === 3 ? 10 : 0)),
      })),
    });

    const page1 = await leaderboard.execute({ deckId: deck.id, userId, page: 1, perPage: 2 });
    const page2 = await leaderboard.execute({ deckId: deck.id, userId, page: 2, perPage: 2 });

    expect([...page1.data, ...page2.data].map((entry) => entry.userId)).toEqual(orderedUserIds);
    expect(page1.meta).toMatchObject({ total: 4, next: 2, prev: null, perPage: 2 });
    expect(page2.meta).toMatchObject({ total: 4, next: null, prev: 1, currentPage: 2 });
    expect(page2.currentUserBest).toEqual(page1.data[1]);
    expect(
      (await leaderboard.execute({ deckId: deck.id, userId, perPage: 500 })).meta.perPage,
    ).toBe(100);
  });
});
