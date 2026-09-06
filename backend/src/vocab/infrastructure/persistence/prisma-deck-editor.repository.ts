import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  DeckEditorRepositoryPort,
  SaveDeckEditorCommand,
} from '../../application/ports/deck-editor-repository.port';
import { Deck } from '../../domain/entities/deck.entity';
import { InvalidFlashcardDataException } from '../../domain/exceptions/vocab-domain.exceptions';
import { VOCAB_ERRORS } from '../../domain/constants/vocab-errors';
import { DeckStatus } from '../../domain/enums/vocab.enums';
import { PrismaDeckMapper } from './mappers/prisma-deck.mapper';

@Injectable()
export class PrismaDeckEditorRepository implements DeckEditorRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(command: SaveDeckEditorCommand): Promise<Deck> {
    const rawDeck = PrismaDeckMapper.toPersistence(command.deck);

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT 1 FROM "decks" WHERE "id" = ${command.deck.id} FOR UPDATE
      `;

      const existingCards = await tx.flashcard.findMany({
        where: { deckId: command.deck.id },
        select: { id: true },
      });
      this.assertValidSnapshot(
        existingCards.map((card) => card.id),
        command.cards.map((card) => card.id).filter((id): id is string => id !== undefined),
        command.deletedCardIds,
      );

      await tx.deck.update({
        where: { id: command.deck.id },
        data: {
          title: rawDeck.title,
          description: rawDeck.description,
          language: rawDeck.language,
          level: rawDeck.level,
          tags: rawDeck.tags,
          visibility: rawDeck.visibility,
          updatedAt: new Date(),
        },
      });

      if (command.deletedCardIds.length > 0) {
        await tx.flashcard.deleteMany({
          where: { deckId: command.deck.id, id: { in: command.deletedCardIds } },
        });
      }

      await Promise.all(
        command.cards.map((card, position) => {
          const data = {
            term: card.term,
            definition: card.definition,
            example: card.example ?? null,
            imageUrl: card.imageUrl ?? null,
            position,
            updatedAt: new Date(),
          };

          if (card.id) {
            return tx.flashcard.update({ where: { id: card.id }, data });
          }

          return tx.flashcard.create({
            data: { deckId: command.deck.id, ...data },
          });
        }),
      );

      if (command.deck.status === DeckStatus.PUBLISHED && command.cards.length < 2) {
        await tx.deck.update({
          where: { id: command.deck.id },
          data: { status: DeckStatus.DRAFT, updatedAt: new Date() },
        });
      }

      const saved = await tx.deck.findUniqueOrThrow({
        where: { id: command.deck.id },
        include: {
          flashcards: { orderBy: { position: 'asc' } },
          _count: { select: { flashcards: true } },
        },
      });
      return PrismaDeckMapper.toDomain(saved);
    });
  }

  private assertValidSnapshot(
    existingCardIds: string[],
    submittedCardIds: string[],
    deletedCardIds: string[],
  ): void {
    const existing = new Set(existingCardIds);
    const submitted = new Set(submittedCardIds);
    const deleted = new Set(deletedCardIds);
    const accountedFor = new Set([...submittedCardIds, ...deletedCardIds]);

    if (
      submitted.size !== submittedCardIds.length ||
      deleted.size !== deletedCardIds.length ||
      [...submitted].some((id) => !existing.has(id)) ||
      [...deleted].some((id) => !existing.has(id)) ||
      [...submitted].some((id) => deleted.has(id)) ||
      accountedFor.size !== existing.size ||
      [...existing].some((id) => !accountedFor.has(id))
    ) {
      throw new InvalidFlashcardDataException(VOCAB_ERRORS.FLASHCARD_EDITOR_INVALID_SNAPSHOT);
    }
  }
}
