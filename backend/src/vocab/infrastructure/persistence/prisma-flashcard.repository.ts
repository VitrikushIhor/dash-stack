import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Flashcard } from '../../domain/entities/flashcard.entity';
import {
  DeleteFlashcardWithLifecycleCommand,
  FlashcardRepositoryPort,
} from '../../application/ports/flashcard-repository.port';
import { PrismaFlashcardMapper } from './mappers/prisma-flashcard.mapper';
import { OrderDirection } from '../../../common/order/order-direction';
import { DeckStatus } from '../../domain/enums/vocab.enums';

@Injectable()
export class PrismaFlashcardRepository implements FlashcardRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(flashcard: Flashcard): Promise<Flashcard> {
    const raw = PrismaFlashcardMapper.toPersistence(flashcard);

    const saved = await this.prisma.flashcard.upsert({
      where: { id: flashcard.id || 'new-card-placeholder' },
      create: {
        deckId: raw.deckId,
        term: raw.term,
        definition: raw.definition,
        example: raw.example,
        imageUrl: raw.imageUrl,
        position: raw.position,
      },
      update: {
        term: raw.term,
        definition: raw.definition,
        example: raw.example,
        imageUrl: raw.imageUrl,
        position: raw.position,
      },
    });

    // Invalidate/touch parent deck timestamp
    await this.prisma.deck
      .update({
        where: { id: raw.deckId },
        data: { updatedAt: new Date() },
      })
      .catch(() => undefined);

    return PrismaFlashcardMapper.toDomain(saved);
  }

  async saveMany(flashcards: Flashcard[]): Promise<Flashcard[]> {
    if (flashcards.length === 0) return [];
    const deckId = flashcards[0].deckId;

    return this.prisma.$transaction(async (tx) => {
      const results = await Promise.all(
        flashcards.map((fc) => {
          const raw = PrismaFlashcardMapper.toPersistence(fc);
          return tx.flashcard.upsert({
            where: { id: fc.id || 'new-card-placeholder' },
            create: {
              deckId: raw.deckId,
              term: raw.term,
              definition: raw.definition,
              example: raw.example,
              imageUrl: raw.imageUrl,
              position: raw.position,
            },
            update: {
              term: raw.term,
              definition: raw.definition,
              example: raw.example,
              imageUrl: raw.imageUrl,
              position: raw.position,
            },
          });
        }),
      );

      await tx.deck
        .update({
          where: { id: deckId },
          data: { updatedAt: new Date() },
        })
        .catch(() => undefined);

      return results.map((r) => PrismaFlashcardMapper.toDomain(r));
    });
  }

  async findById(id: string): Promise<Flashcard | null> {
    const raw = await this.prisma.flashcard.findUnique({
      where: { id },
    });

    return raw ? PrismaFlashcardMapper.toDomain(raw) : null;
  }

  async findByDeckId(deckId: string): Promise<Flashcard[]> {
    const rawCards = await this.prisma.flashcard.findMany({
      where: { deckId },
      orderBy: { position: OrderDirection.asc },
    });

    return rawCards.map((c) => PrismaFlashcardMapper.toDomain(c));
  }

  async getMaxPositionByDeckId(deckId: string): Promise<number> {
    const maxCard = await this.prisma.flashcard.findFirst({
      where: { deckId },
      orderBy: { position: OrderDirection.desc },
      select: { position: true },
    });

    return maxCard ? maxCard.position : 0;
  }

  async updatePositions(deckId: string, orderedCardIds: string[]): Promise<void> {
    if (orderedCardIds.length === 0) return;

    await this.prisma.$transaction(async (tx) => {
      await Promise.all(
        orderedCardIds.map((cardId, index) =>
          tx.flashcard.updateMany({
            where: { id: cardId, deckId },
            data: { position: index + 1 },
          }),
        ),
      );

      await tx.deck
        .update({
          where: { id: deckId },
          data: { updatedAt: new Date() },
        })
        .catch(() => undefined);
    });
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.prisma.flashcard.delete({
      where: { id },
    });

    await this.prisma.deck
      .update({
        where: { id: deleted.deckId },
        data: { updatedAt: new Date() },
      })
      .catch(() => undefined);
  }

  async deleteAndDemotePublishedDeckIfBelowMinimum(
    command: DeleteFlashcardWithLifecycleCommand,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT 1 FROM "decks" WHERE "id" = ${command.deckId} FOR UPDATE
      `;

      await tx.flashcard.delete({
        where: { id: command.cardId },
      });

      const remainingCardCount = await tx.flashcard.count({
        where: { deckId: command.deckId },
      });

      if (remainingCardCount < command.minimumCardCount) {
        await tx.deck.updateMany({
          where: {
            id: command.deckId,
            status: DeckStatus.PUBLISHED,
          },
          data: {
            status: DeckStatus.DRAFT,
            updatedAt: new Date(),
          },
        });
        return;
      }

      await tx.deck.update({
        where: { id: command.deckId },
        data: { updatedAt: new Date() },
      });
    });
  }
}
