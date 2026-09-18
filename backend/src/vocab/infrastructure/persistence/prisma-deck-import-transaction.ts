import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { setTimeout } from 'node:timers/promises';
import {
  DeckImportTransactionContext,
  DeckImportTransactionPort,
} from '../../application/ports/deck-import-transaction.port';
import { VocabImportConflictException } from '../../domain/exceptions/vocab-domain.exceptions';
import { PrismaDeckMapper } from './mappers/prisma-deck.mapper';
import { PrismaFlashcardMapper } from './mappers/prisma-flashcard.mapper';
import { isPrismaWriteConflict } from './prisma-write-conflict';

@Injectable()
export class PrismaDeckImportTransaction implements DeckImportTransactionPort {
  constructor(private readonly prisma: PrismaService) {}

  async run<T>(work: (context: DeckImportTransactionContext) => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (tx) =>
            work({
              deckRepository: {
                findByIdForUpdate: async (deckId) => {
                  const rows = await tx.$queryRaw<{ id: string }[]>`
                    SELECT "id" FROM "decks" WHERE "id" = ${deckId} FOR UPDATE
                  `;

                  if (rows.length === 0) return null;
                  const deck = await tx.deck.findUniqueOrThrow({ where: { id: deckId } });

                  return PrismaDeckMapper.toDomain(deck);
                },
              },
              receiptRepository: {
                findByUserAndImportId: (userId, importId) =>
                  tx.vocabImportReceipt.findUnique({
                    where: { userId_importId: { userId, importId } },
                  }),
                save: async (receipt) => {
                  await tx.vocabImportReceipt.create({ data: receipt });
                },
              },
              flashcardRepository: {
                append: async (deckId, cards) => {
                  const lastCard = await tx.flashcard.findFirst({
                    where: { deckId },
                    orderBy: { position: 'desc' },
                    select: { position: true },
                  });
                  const basePosition = lastCard ? lastCard.position + 1 : 0;
                  const created = await tx.flashcard.createManyAndReturn({
                    data: cards.map((card, index) => ({
                      deckId,
                      term: card.term,
                      definition: card.definition,
                      example: card.example ?? null,
                      imageUrl: card.imageUrl ?? null,
                      position: basePosition + index,
                    })),
                  });

                  return created
                    .sort((left, right) => left.position - right.position)
                    .map(PrismaFlashcardMapper.toDomain);
                },
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
        if (attempt >= 3) throw new VocabImportConflictException();
        await setTimeout(25 * 2 ** attempt);
      }
    }
  }
}
