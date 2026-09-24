import { PrismaService } from 'nestjs-prisma';
import { DeckStatus } from '../../../domain/enums/vocab.enums';
import { PrismaFlashcardRepository } from '../../../infrastructure/persistence/prisma-flashcard.repository';

describe('PrismaFlashcardRepository', () => {
  const command = {
    cardId: 'card-1',
    deckId: 'deck-1',
    minimumCardCount: 2,
  };

  const createRepository = (remainingCardCount: number) => {
    const transaction = {
      $executeRaw: jest.fn().mockResolvedValue(1),
      flashcard: {
        delete: jest.fn().mockResolvedValue({ id: command.cardId }),
        count: jest.fn().mockResolvedValue(remainingCardCount),
      },
      deck: {
        update: jest.fn().mockResolvedValue({ id: command.deckId }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const prisma = {
      $transaction: jest
        .fn()
        .mockImplementation(
          async (callback: (tx: typeof transaction) => Promise<void>): Promise<void> =>
            callback(transaction),
        ),
    };

    return {
      prisma,
      repository: new PrismaFlashcardRepository(prisma as unknown as PrismaService),
      transaction,
    };
  };

  it('deletes and demotes a published deck in one transaction when fewer than two cards remain', async () => {
    const { prisma, repository, transaction } = createRepository(1);

    await repository.deleteAndDemotePublishedDeckIfBelowMinimum(command);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(transaction.$executeRaw).toHaveBeenCalledTimes(1);
    expect(transaction.flashcard.delete).toHaveBeenCalledWith({
      where: { id: command.cardId },
    });
    expect(transaction.flashcard.count).toHaveBeenCalledWith({
      where: { deckId: command.deckId },
    });
    expect(transaction.deck.updateMany).toHaveBeenCalledWith({
      where: { id: command.deckId, status: DeckStatus.PUBLISHED },
      data: { status: DeckStatus.DRAFT, updatedAt: expect.any(Date) },
    });
    expect(transaction.deck.update).not.toHaveBeenCalled();
  });

  it('keeps the deck status when its remaining card count satisfies the publish minimum', async () => {
    const { repository, transaction } = createRepository(2);

    await repository.deleteAndDemotePublishedDeckIfBelowMinimum(command);

    expect(transaction.deck.updateMany).not.toHaveBeenCalled();
    expect(transaction.deck.update).toHaveBeenCalledWith({
      where: { id: command.deckId },
      data: { updatedAt: expect.any(Date) },
    });
  });

  it('persists a reorder as zero-based contiguous positions in one transaction', async () => {
    const transaction = {
      flashcard: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      deck: {
        update: jest.fn().mockResolvedValue({ id: 'deck-1' }),
      },
    };
    const prisma = {
      $transaction: jest
        .fn()
        .mockImplementation(
          async (callback: (tx: typeof transaction) => Promise<void>): Promise<void> =>
            callback(transaction),
        ),
    };
    const repository = new PrismaFlashcardRepository(prisma as unknown as PrismaService);

    await repository.updatePositions('deck-1', ['card-3', 'card-1', 'card-2']);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(transaction.flashcard.updateMany).toHaveBeenNthCalledWith(1, {
      where: { id: 'card-3', deckId: 'deck-1' },
      data: { position: 0 },
    });
    expect(transaction.flashcard.updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: 'card-1', deckId: 'deck-1' },
      data: { position: 1 },
    });
    expect(transaction.flashcard.updateMany).toHaveBeenNthCalledWith(3, {
      where: { id: 'card-2', deckId: 'deck-1' },
      data: { position: 2 },
    });
  });
});
