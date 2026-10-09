import { VocabProgressConflictException } from '../../domain/exceptions/vocab-domain.exceptions';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { setTimeout } from 'node:timers/promises';
import {
  StudyProgressTransactionContext,
  StudyProgressTransactionPort,
} from '../../application/ports/study-progress-transaction.port';
import { PrismaDeckMapper } from './mappers/prisma-deck.mapper';
import { PrismaFlashcardMapper } from './mappers/prisma-flashcard.mapper';
import { PrismaVocabProgressMapper } from './mappers/prisma-vocab-progress.mapper';
import { isPrismaWriteConflict } from './prisma-write-conflict';
import { upsertVocabProgressBatch } from './upsert-vocab-progress-batch';

@Injectable()
export class PrismaStudyProgressTransaction implements StudyProgressTransactionPort {
  constructor(private readonly prisma: PrismaService) {}

  async run<T>(work: (context: StudyProgressTransactionContext) => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (tx) =>
            work({
              studyAttemptRepository: {
                find: (userId, attemptId) =>
                  tx.vocabStudyAttempt.findUnique({
                    where: { userId_attemptId: { userId, attemptId } },
                  }),
                save: async (receipt) => {
                  await tx.vocabStudyAttempt.create({ data: receipt });
                },
              },
              deckRepository: {
                findById: async (id) => {
                  const deck = await tx.deck.findUnique({ where: { id } });
                  return deck ? PrismaDeckMapper.toDomain(deck) : null;
                },
              },
              flashcardRepository: {
                findById: async (id) => {
                  const card = await tx.flashcard.findUnique({ where: { id } });
                  return card ? PrismaFlashcardMapper.toDomain(card) : null;
                },
                findByDeckId: async (deckId) =>
                  (await tx.flashcard.findMany({ where: { deckId } })).map(
                    PrismaFlashcardMapper.toDomain,
                  ),
              },
              vocabProgressRepository: {
                findByUserAndCard: async (userId, deckId, flashcardId) => {
                  const progress = await tx.vocabProgress.findUnique({
                    where: { userId_deckId_flashcardId: { userId, deckId, flashcardId } },
                  });
                  return progress ? PrismaVocabProgressMapper.toDomain(progress) : null;
                },
                save: async (progress) => {
                  const [saved] = await upsertVocabProgressBatch(tx, [progress]);
                  return saved;
                },
                findByUserAndCardIds: async (userId, deckId, flashcardIds) =>
                  (
                    await tx.vocabProgress.findMany({
                      where: { userId, deckId, flashcardId: { in: flashcardIds } },
                    })
                  ).map(PrismaVocabProgressMapper.toDomain),
                upsertBatch: (progress) => upsertVocabProgressBatch(tx, progress),
              },
            }),
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            maxWait: 5000,
            timeout: 10000,
          },
        );
      } catch (error: unknown) {
        if (!isPrismaWriteConflict(error)) throw error;
        if (attempt >= 3) throw new VocabProgressConflictException();
        await setTimeout(25 * 2 ** attempt);
      }
    }
  }
}
