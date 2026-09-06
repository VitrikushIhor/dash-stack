import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { DeckStatus, DeckVisibility, Prisma } from '@prisma/client';
import { VocabProgress } from '../../domain/entities/vocab-progress.entity';
import { VocabProgressRepositoryPort } from '../../application/ports/vocab-progress-repository.port';
import { DueReviewsReadModel } from '../../application/read-models/due-reviews.read-model';
import { StudyCardReadModel } from '../../application/read-models/study-card.read-model';
import { PrismaVocabProgressMapper } from './mappers/prisma-vocab-progress.mapper';

type FlashcardWithProgress = Prisma.FlashcardGetPayload<{
  include: { progress: true };
}>;

@Injectable()
export class PrismaVocabProgressRepository implements VocabProgressRepositoryPort {
  private static readonly BULK_CHUNK_SIZE = 100;

  constructor(private readonly prisma: PrismaService) {}

  public async findByUserAndCard(
    userId: string,
    deckId: string,
    flashcardId: string,
  ): Promise<VocabProgress | null> {
    const raw = await this.prisma.vocabProgress.findUnique({
      where: {
        userId_deckId_flashcardId: {
          userId,
          deckId,
          flashcardId,
        },
      },
    });

    return raw ? PrismaVocabProgressMapper.toDomain(raw) : null;
  }

  public async findByUserAndDeck(userId: string, deckId: string): Promise<VocabProgress[]> {
    const rawList = await this.prisma.vocabProgress.findMany({
      where: {
        userId,
        deckId,
      },
    });

    return rawList.map(PrismaVocabProgressMapper.toDomain);
  }

  public async findByUserAndCardIds(
    userId: string,
    deckId: string,
    flashcardIds: string[],
  ): Promise<VocabProgress[]> {
    const rawList = await this.prisma.vocabProgress.findMany({
      where: {
        userId,
        deckId,
        flashcardId: {
          in: flashcardIds,
        },
      },
    });

    return rawList.map(PrismaVocabProgressMapper.toDomain);
  }

  public async getStudyCards(
    userId: string | null,
    deckId: string,
    options?: { onlyStarred?: boolean; onlyDue?: boolean },
  ): Promise<StudyCardReadModel[]> {
    const now = new Date();

    const where: Prisma.FlashcardWhereInput = {
      deckId,
      ...(options?.onlyStarred && userId
        ? {
            progress: {
              some: {
                userId,
                isStarred: true,
              },
            },
          }
        : {}),
      ...(options?.onlyDue && userId
        ? {
            OR: [
              { progress: { none: { userId } } },
              { progress: { some: { userId, nextReviewAt: { lte: now } } } },
            ],
          }
        : {}),
    };

    const flashcards: FlashcardWithProgress[] = await this.prisma.flashcard.findMany({
      where,
      include: {
        progress: userId
          ? {
              where: { userId },
            }
          : true,
      },
      orderBy: { position: 'asc' },
    });

    return flashcards.map((card) => {
      const rawProgress = card.progress?.[0] ?? null;
      return PrismaVocabProgressMapper.toStudyCardReadModel(card, rawProgress);
    });
  }

  public async getDueReviews(userId: string, deckId?: string): Promise<DueReviewsReadModel> {
    const now = new Date();
    const accessibleDeckWhere: Prisma.DeckWhereInput = {
      OR: [
        { ownerUserId: userId },
        {
          status: DeckStatus.PUBLISHED,
          visibility: { in: [DeckVisibility.PUBLIC, DeckVisibility.UNLISTED] },
        },
      ],
    };

    // Fast path: if filtered by a single deck, do a single targeted count
    if (deckId) {
      const [dueCount, deck] = await Promise.all([
        this.prisma.vocabProgress.count({
          where: {
            userId,
            deckId,
            nextReviewAt: { lte: now },
            deck: accessibleDeckWhere,
          },
        }),
        this.prisma.deck.findFirst({
          where: { id: deckId, ...accessibleDeckWhere },
          select: { id: true, title: true },
        }),
      ]);

      return {
        totalDue: dueCount,
        perDeck: deck
          ? [
              {
                deckId: deck.id,
                deckTitle: deck.title,
                dueCount,
              },
            ]
          : [],
      };
    }

    // Multi-deck aggregation: single groupBy query, derive total in JS without extra count() roundtrip
    const groupedCounts = await this.prisma.vocabProgress.groupBy({
      by: ['deckId'],
      where: {
        userId,
        nextReviewAt: { lte: now },
        deck: accessibleDeckWhere,
      },
      _count: {
        _all: true,
      },
    });

    if (groupedCounts.length === 0) {
      return {
        totalDue: 0,
        perDeck: [],
      };
    }

    const totalDue = groupedCounts.reduce((sum, g) => sum + g._count._all, 0);

    const deckIds = groupedCounts.map((g) => g.deckId);
    const decks = await this.prisma.deck.findMany({
      where: { id: { in: deckIds }, ...accessibleDeckWhere },
      select: { id: true, title: true },
    });

    const deckTitleMap = new Map(decks.map((d) => [d.id, d.title]));

    const perDeck = groupedCounts.map((g) => ({
      deckId: g.deckId,
      deckTitle: deckTitleMap.get(g.deckId) ?? 'Unknown Deck',
      dueCount: g._count._all,
    }));

    return {
      totalDue,
      perDeck,
    };
  }

  public async save(progress: VocabProgress): Promise<VocabProgress> {
    const raw = PrismaVocabProgressMapper.toPersistence(progress);
    const upsertArgs = this.buildUpsertArgs(raw);

    const saved = await this.prisma.vocabProgress.upsert(upsertArgs);
    return PrismaVocabProgressMapper.toDomain(saved);
  }

  public async upsertBatch(progressList: VocabProgress[]): Promise<VocabProgress[]> {
    if (progressList.length === 0) {
      return [];
    }

    const rawList = progressList.map(PrismaVocabProgressMapper.toPersistence);
    const now = new Date();

    // High-performance multi-row Postgres bulk upsert with chunking
    for (let i = 0; i < rawList.length; i += PrismaVocabProgressRepository.BULK_CHUNK_SIZE) {
      const chunk = rawList.slice(i, i + PrismaVocabProgressRepository.BULK_CHUNK_SIZE);

      const values = Prisma.join(
        chunk.map(
          (r) =>
            Prisma.sql`(${r.id || Prisma.sql`gen_random_uuid()::text`}, ${r.userId}, ${r.deckId}, ${r.flashcardId}, ${r.status}::"VocabProgressStatus", ${r.box}, ${r.isStarred}, ${r.correctStreak}, ${r.correctCount}, ${r.incorrectCount}, ${r.lastReviewedAt}, ${r.nextReviewAt}, ${now}, ${now})`,
        ),
      );

      await this.prisma.$executeRaw`
        INSERT INTO "vocab_progress" (
          "id", "userId", "deckId", "flashcardId", "status", "box", "isStarred",
          "correctStreak", "correctCount", "incorrectCount", "lastReviewedAt", "nextReviewAt", "createdAt", "updatedAt"
        )
        VALUES ${values}
        ON CONFLICT ("userId", "deckId", "flashcardId")
        DO UPDATE SET
          "status" = EXCLUDED."status",
          "box" = EXCLUDED."box",
          "isStarred" = EXCLUDED."isStarred",
          "correctStreak" = EXCLUDED."correctStreak",
          "correctCount" = EXCLUDED."correctCount",
          "incorrectCount" = EXCLUDED."incorrectCount",
          "lastReviewedAt" = EXCLUDED."lastReviewedAt",
          "nextReviewAt" = EXCLUDED."nextReviewAt",
          "updatedAt" = EXCLUDED."updatedAt";
      `;
    }

    return this.findByUserAndCardIds(
      rawList[0].userId,
      rawList[0].deckId,
      rawList.map((r) => r.flashcardId),
    );
  }

  private buildUpsertArgs(
    raw: ReturnType<typeof PrismaVocabProgressMapper.toPersistence>,
  ): Prisma.VocabProgressUpsertArgs {
    return {
      where: {
        userId_deckId_flashcardId: {
          userId: raw.userId,
          deckId: raw.deckId,
          flashcardId: raw.flashcardId,
        },
      },
      create: {
        id: raw.id,
        userId: raw.userId,
        deckId: raw.deckId,
        flashcardId: raw.flashcardId,
        status: raw.status,
        box: raw.box,
        isStarred: raw.isStarred,
        correctStreak: raw.correctStreak,
        correctCount: raw.correctCount,
        incorrectCount: raw.incorrectCount,
        lastReviewedAt: raw.lastReviewedAt,
        nextReviewAt: raw.nextReviewAt,
      },
      update: {
        status: raw.status,
        box: raw.box,
        isStarred: raw.isStarred,
        correctStreak: raw.correctStreak,
        correctCount: raw.correctCount,
        incorrectCount: raw.incorrectCount,
        lastReviewedAt: raw.lastReviewedAt,
        nextReviewAt: raw.nextReviewAt,
      },
    };
  }
}
