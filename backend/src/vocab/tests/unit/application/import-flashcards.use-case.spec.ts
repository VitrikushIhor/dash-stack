import { ImportFlashcardsUseCase } from '../../../application/use-cases/import-flashcards.use-case';
import {
  DeckImportTransactionContext,
  VocabImportReceipt,
} from '../../../application/ports/deck-import-transaction.port';
import { Deck } from '../../../domain/entities/deck.entity';
import { Flashcard } from '../../../domain/entities/flashcard.entity';
import { DeckVisibility } from '../../../domain/enums/vocab.enums';
import {
  DeckAccessForbiddenException,
  ImportReceiptConflictException,
  VocabImportCardLimitExceededException,
} from '../../../domain/exceptions/vocab-domain.exceptions';

describe('ImportFlashcardsUseCase', () => {
  let useCase: ImportFlashcardsUseCase;
  let deck: Deck;
  let receipts: VocabImportReceipt[];
  let cards: Flashcard[];
  let touchUpdatedAt: jest.Mock<Promise<void>, [string]>;

  beforeEach(() => {
    receipts = [];
    cards = [];
    touchUpdatedAt = jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined);
    deck = Deck.create({ id: 'deck-1', ownerUserId: 'owner-1', title: 'Deck' });
    let sequence = 0;
    const context: DeckImportTransactionContext = {
      deckRepository: {
        findByIdForUpdate: async () => deck,
        touchUpdatedAt,
      },
      receiptRepository: {
        findByUserAndImportId: async (userId, importId) =>
          receipts.find((receipt) => receipt.userId === userId && receipt.importId === importId) ??
          null,
        save: async (receipt) => {
          receipts.push(receipt);
        },
      },
      flashcardRepository: {
        append: async (deckId, imported) => {
          const appended = imported.map((input, index) =>
            Flashcard.reconstitute({
              id: `card-${++sequence}`,
              deckId,
              term: input.term,
              definition: input.definition,
              example: input.example ?? null,
              imageUrl: input.imageUrl ?? null,
              position: cards.length + index,
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
          );

          cards.push(...appended);

          return appended;
        },
      },
    };

    useCase = new ImportFlashcardsUseCase({ run: (work) => work(context) });
  });

  it('should_append_cards_in_submitted_order_and_store_a_receipt', async () => {
    const result = await useCase.execute({
      deckId: 'deck-1',
      userId: 'owner-1',
      importId: 'import-1',
      cards: [
        { term: 'One', definition: 'First' },
        { term: 'Two', definition: 'Second', example: 'Example' },
      ],
    });

    expect(result).toEqual({
      importId: 'import-1',
      cardIds: ['card-1', 'card-2'],
      importedCount: 2,
      idempotent: false,
    });
    expect(cards.map((card) => card.term)).toEqual(['One', 'Two']);
    expect(cards.map((card) => card.position)).toEqual([0, 1]);
    expect(receipts).toHaveLength(1);
    expect(touchUpdatedAt).toHaveBeenCalledWith('deck-1');
  });

  it('should_reject_more_cards_than_the_import_limit_before_opening_a_transaction', async () => {
    await expect(
      useCase.execute({
        deckId: 'deck-1',
        userId: 'owner-1',
        importId: 'too-many',
        cards: Array.from({ length: 2001 }, (_, index) => ({
          term: `term-${index}`,
          definition: `definition-${index}`,
        })),
      }),
    ).rejects.toThrow(VocabImportCardLimitExceededException);
    expect(cards).toHaveLength(0);
  });

  it('should_return_the_original_result_without_duplicate_cards_on_retry', async () => {
    const command = {
      deckId: 'deck-1',
      userId: 'owner-1',
      importId: 'import-1',
      cards: [{ term: 'One', definition: 'First' }],
    };

    await useCase.execute(command);

    await expect(useCase.execute(command)).resolves.toEqual({
      importId: 'import-1',
      cardIds: ['card-1'],
      importedCount: 1,
      idempotent: true,
    });
    expect(cards).toHaveLength(1);
    expect(touchUpdatedAt).toHaveBeenCalledTimes(1);
  });

  it('should_reject_reusing_an_import_id_for_different_content', async () => {
    await useCase.execute({
      deckId: 'deck-1',
      userId: 'owner-1',
      importId: 'import-1',
      cards: [{ term: 'One', definition: 'First' }],
    });

    await expect(
      useCase.execute({
        deckId: 'deck-1',
        userId: 'owner-1',
        importId: 'import-1',
        cards: [{ term: 'Two', definition: 'Second' }],
      }),
    ).rejects.toThrow(ImportReceiptConflictException);
    expect(cards).toHaveLength(1);
  });

  it('should_recheck_owner_access_inside_the_transaction', async () => {
    deck = Deck.create({
      id: 'deck-1',
      ownerUserId: 'owner-1',
      title: 'Shared deck',
      visibility: DeckVisibility.PUBLIC,
    });

    await expect(
      useCase.execute({
        deckId: 'deck-1',
        userId: 'other-user',
        importId: 'import-1',
        cards: [{ term: 'One', definition: 'First' }],
      }),
    ).rejects.toThrow(DeckAccessForbiddenException);
    expect(cards).toHaveLength(0);
    expect(receipts).toHaveLength(0);
  });
});
