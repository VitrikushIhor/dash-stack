import { Prisma } from '@prisma/client';
import { VocabProgress } from '../../domain/entities/vocab-progress.entity';
import { PrismaVocabProgressMapper } from './mappers/prisma-vocab-progress.mapper';

export async function upsertVocabProgressBatch(
  tx: Prisma.TransactionClient,
  progressList: VocabProgress[],
): Promise<VocabProgress[]> {
  if (progressList.length === 0) {
    return [];
  }

  const rawList = progressList.map(PrismaVocabProgressMapper.toPersistence);
  const now = new Date();

  // High-performance multi-row Postgres bulk upsert with chunking
  for (let i = 0; i < rawList.length; i += 100) {
    const chunk = rawList.slice(i, i + 100);

    const values = Prisma.join(
      chunk.map(
        (r) =>
          Prisma.sql`(${r.id || Prisma.sql`gen_random_uuid()::text`}, ${r.userId}, ${r.deckId}, ${r.flashcardId}, ${r.status}::"VocabProgressStatus", ${r.box}, ${r.isStarred}, ${r.correctStreak}, ${r.correctCount}, ${r.incorrectCount}, ${r.lastReviewedAt}, ${r.nextReviewAt}, ${now}, ${now})`,
      ),
    );

    await tx.$executeRaw`
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

  const saved = await tx.vocabProgress.findMany({
    where: {
      userId: rawList[0].userId,
      deckId: rawList[0].deckId,
      flashcardId: { in: rawList.map((row) => row.flashcardId) },
    },
  });
  const byCardId = new Map(saved.map((row) => [row.flashcardId, row]));
  return rawList.map((row) => {
    const persisted = byCardId.get(row.flashcardId);
    if (!persisted) throw new Error('Progress batch persistence returned an incomplete result');
    return PrismaVocabProgressMapper.toDomain(persisted);
  });
}
