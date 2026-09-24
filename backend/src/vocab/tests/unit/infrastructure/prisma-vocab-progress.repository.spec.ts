import { DeckStatus, DeckVisibility } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { PrismaVocabProgressRepository } from '../../../infrastructure/persistence/prisma-vocab-progress.repository';

describe('PrismaVocabProgressRepository', () => {
  const userId = 'learner-1';
  const now = new Date('2026-09-05T12:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('excludes progress for decks that are no longer accessible when aggregating due reviews', async () => {
    const prismaMock = {
      vocabProgress: {
        groupBy: jest.fn().mockResolvedValue([]),
      },
      deck: {
        findMany: jest.fn(),
      },
    };
    const repository = new PrismaVocabProgressRepository(prismaMock as unknown as PrismaService);

    await repository.getDueReviews(userId);

    expect(prismaMock.vocabProgress.groupBy).toHaveBeenCalledWith({
      by: ['deckId'],
      where: {
        userId,
        nextReviewAt: { lte: now },
        deck: {
          OR: [
            { ownerUserId: userId },
            {
              status: DeckStatus.PUBLISHED,
              visibility: { in: [DeckVisibility.PUBLIC, DeckVisibility.UNLISTED] },
            },
          ],
        },
      },
      _count: { _all: true },
    });
  });

  it('does not expose a requested deck title when the learner no longer has access', async () => {
    const prismaMock = {
      vocabProgress: {
        count: jest.fn().mockResolvedValue(0),
      },
      deck: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
    const repository = new PrismaVocabProgressRepository(prismaMock as unknown as PrismaService);

    const result = await repository.getDueReviews(userId, 'private-deck');

    expect(result).toEqual({ totalDue: 0, perDeck: [] });
    expect(prismaMock.vocabProgress.count).toHaveBeenCalledWith({
      where: {
        userId,
        deckId: 'private-deck',
        nextReviewAt: { lte: now },
        deck: {
          OR: [
            { ownerUserId: userId },
            {
              status: DeckStatus.PUBLISHED,
              visibility: { in: [DeckVisibility.PUBLIC, DeckVisibility.UNLISTED] },
            },
          ],
        },
      },
    });
  });

  it('searches deck cards with stable pagination and server-derived counters', async () => {
    const prismaMock = {
      flashcard: {
        count: jest.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(100),
        findMany: jest.fn().mockResolvedValue([]),
      },
      vocabProgress: {
        count: jest.fn().mockResolvedValueOnce(8).mockResolvedValueOnce(5).mockResolvedValueOnce(2),
      },
    };
    const repository = new PrismaVocabProgressRepository(prismaMock as unknown as PrismaService);

    const result = await repository.browseDeckCards(userId, 'deck-1', {
      search: 'Deploy',
      page: 2,
      perPage: 25,
    });

    expect(prismaMock.flashcard.findMany).toHaveBeenCalledWith({
      where: {
        deckId: 'deck-1',
        OR: [
          { term: { contains: 'Deploy', mode: 'insensitive' } },
          { definition: { contains: 'Deploy', mode: 'insensitive' } },
        ],
      },
      include: { progress: { where: { userId } } },
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
      skip: 25,
      take: 25,
    });
    expect(result).toEqual({
      data: [],
      meta: {
        total: 1,
        lastPage: 1,
        currentPage: 2,
        perPage: 25,
        prev: 1,
        next: null,
      },
      summary: { total: 100, due: 8, starred: 5, dueAndStarred: 2 },
    });
  });
});
