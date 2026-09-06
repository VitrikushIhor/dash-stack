import { CreateFlashcardUseCase } from '../../../application/use-cases/create-flashcard.use-case';
import { UpdateFlashcardUseCase } from '../../../application/use-cases/update-flashcard.use-case';
import { DeleteFlashcardUseCase } from '../../../application/use-cases/delete-flashcard.use-case';
import { ReorderFlashcardsUseCase } from '../../../application/use-cases/reorder-flashcards.use-case';
import { DeckRepositoryPort } from '../../../application/ports/deck-repository.port';
import { FlashcardRepositoryPort } from '../../../application/ports/flashcard-repository.port';
import { Deck } from '../../../domain/entities/deck.entity';
import { Flashcard } from '../../../domain/entities/flashcard.entity';
import {
  DeckAccessForbiddenException,
  FlashcardNotFoundException,
  InvalidFlashcardDataException,
} from '../../../domain/exceptions/vocab-domain.exceptions';

describe('Flashcard Use Cases', () => {
  let mockDeckRepository: jest.Mocked<DeckRepositoryPort>;
  let mockFlashcardRepository: jest.Mocked<FlashcardRepositoryPort>;
  let createFlashcardUseCase: CreateFlashcardUseCase;
  let updateFlashcardUseCase: UpdateFlashcardUseCase;
  let deleteFlashcardUseCase: DeleteFlashcardUseCase;
  let reorderFlashcardsUseCase: ReorderFlashcardsUseCase;

  const testDeck = Deck.create({
    id: 'deck-1',
    ownerUserId: 'user-1',
    title: 'Test Deck',
  });

  beforeEach(() => {
    mockDeckRepository = {
      save: jest.fn(),
      findById: jest.fn().mockResolvedValue(testDeck),
      findBySlug: jest.fn(),
      findMyDecks: jest.fn(),
      searchPublicDecks: jest.fn(),
      countFlashcardsByDeckId: jest.fn(),
      forkDeck: jest.fn(),
      delete: jest.fn(),
    };

    mockFlashcardRepository = {
      save: jest.fn((card: Flashcard) => Promise.resolve(card)),
      saveMany: jest.fn((cards: Flashcard[]) => Promise.resolve(cards)),
      findById: jest.fn(),
      findByDeckId: jest.fn(),
      getMaxPositionByDeckId: jest.fn().mockResolvedValue(0),
      updatePositions: jest.fn(),
      delete: jest.fn(),
      deleteAndDemotePublishedDeckIfBelowMinimum: jest.fn(),
    };

    createFlashcardUseCase = new CreateFlashcardUseCase(
      mockDeckRepository,
      mockFlashcardRepository,
    );
    updateFlashcardUseCase = new UpdateFlashcardUseCase(
      mockDeckRepository,
      mockFlashcardRepository,
    );
    deleteFlashcardUseCase = new DeleteFlashcardUseCase(
      mockDeckRepository,
      mockFlashcardRepository,
    );
    reorderFlashcardsUseCase = new ReorderFlashcardsUseCase(
      mockDeckRepository,
      mockFlashcardRepository,
    );
  });

  describe('CreateFlashcardUseCase', () => {
    it('should create flashcards appended at the next available positions', async () => {
      mockFlashcardRepository.getMaxPositionByDeckId.mockResolvedValueOnce(3);

      const result = await createFlashcardUseCase.execute({
        deckId: 'deck-1',
        userId: 'user-1',
        cards: [
          { term: 'Card 1', definition: 'Def 1' },
          { term: 'Card 2', definition: 'Def 2' },
        ],
      });

      expect(result).toHaveLength(2);
      expect(result[0].position).toBe(4);
      expect(result[1].position).toBe(5);
      expect(mockFlashcardRepository.saveMany).toHaveBeenCalledTimes(1);
    });

    it('should throw ForbiddenException if requester does not own the deck', async () => {
      await expect(
        createFlashcardUseCase.execute({
          deckId: 'deck-1',
          userId: 'user-2',
          cards: [{ term: 'Term', definition: 'Def' }],
        }),
      ).rejects.toThrow(DeckAccessForbiddenException);
    });
  });

  describe('UpdateFlashcardUseCase', () => {
    it('should update card when owner requests it', async () => {
      const card = Flashcard.create({
        id: 'card-1',
        deckId: 'deck-1',
        term: 'Old Term',
        definition: 'Old Def',
        position: 1,
      });
      mockFlashcardRepository.findById.mockResolvedValueOnce(card);

      const result = await updateFlashcardUseCase.execute({
        deckId: 'deck-1',
        cardId: 'card-1',
        userId: 'user-1',
        term: 'New Term',
      });

      expect(result.term).toBe('New Term');
      expect(mockFlashcardRepository.save).toHaveBeenCalled();
    });

    it('should throw FlashcardNotFoundException if card does not belong to the deck', async () => {
      const card = Flashcard.create({
        id: 'card-1',
        deckId: 'other-deck',
        term: 'Term',
        definition: 'Def',
        position: 1,
      });
      mockFlashcardRepository.findById.mockResolvedValueOnce(card);

      await expect(
        updateFlashcardUseCase.execute({
          deckId: 'deck-1',
          cardId: 'card-1',
          userId: 'user-1',
          term: 'New Term',
        }),
      ).rejects.toThrow(FlashcardNotFoundException);
    });
  });

  describe('DeleteFlashcardUseCase', () => {
    it('should delete card when owner requests it', async () => {
      const card = Flashcard.create({
        id: 'card-1',
        deckId: 'deck-1',
        term: 'Term',
        definition: 'Def',
        position: 1,
      });
      mockFlashcardRepository.findById.mockResolvedValueOnce(card);

      await deleteFlashcardUseCase.execute({
        deckId: 'deck-1',
        cardId: 'card-1',
        userId: 'user-1',
      });

      expect(
        mockFlashcardRepository.deleteAndDemotePublishedDeckIfBelowMinimum,
      ).toHaveBeenCalledWith({
        cardId: 'card-1',
        deckId: 'deck-1',
        minimumCardCount: 2,
      });
    });

    it('should delegate published-deck demotion to the atomic persistence operation', async () => {
      const card = Flashcard.create({
        id: 'card-1',
        deckId: 'deck-1',
        term: 'Term',
        definition: 'Def',
        position: 1,
      });
      mockFlashcardRepository.findById.mockResolvedValueOnce(card);

      await deleteFlashcardUseCase.execute({
        deckId: 'deck-1',
        cardId: 'card-1',
        userId: 'user-1',
      });

      expect(
        mockFlashcardRepository.deleteAndDemotePublishedDeckIfBelowMinimum,
      ).toHaveBeenCalledWith({
        cardId: 'card-1',
        deckId: 'deck-1',
        minimumCardCount: 2,
      });
      expect(mockFlashcardRepository.delete).not.toHaveBeenCalled();
      expect(mockDeckRepository.countFlashcardsByDeckId).not.toHaveBeenCalled();
      expect(mockDeckRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('ReorderFlashcardsUseCase', () => {
    const existingCards = ['card-1', 'card-2', 'card-3'].map((id, position) =>
      Flashcard.create({
        id,
        deckId: 'deck-1',
        term: `Term ${position}`,
        definition: `Definition ${position}`,
        position,
      }),
    );

    it('should reorder an exact permutation of the deck cards', async () => {
      mockFlashcardRepository.findByDeckId.mockResolvedValueOnce(existingCards);

      await reorderFlashcardsUseCase.execute({
        deckId: 'deck-1',
        userId: 'user-1',
        orderedCardIds: ['card-3', 'card-1', 'card-2'],
      });

      expect(mockFlashcardRepository.updatePositions).toHaveBeenCalledWith('deck-1', [
        'card-3',
        'card-1',
        'card-2',
      ]);
    });

    it.each([
      ['duplicates', ['card-1', 'card-1', 'card-2']],
      ['missing cards', ['card-1', 'card-2']],
      ['a foreign card', ['card-1', 'card-2', 'card-other']],
    ])('rejects an order containing %s before persistence', async (_, orderedCardIds) => {
      mockFlashcardRepository.findByDeckId.mockResolvedValueOnce(existingCards);

      await expect(
        reorderFlashcardsUseCase.execute({
          deckId: 'deck-1',
          userId: 'user-1',
          orderedCardIds,
        }),
      ).rejects.toThrow(InvalidFlashcardDataException);

      expect(mockFlashcardRepository.updatePositions).not.toHaveBeenCalled();
    });

    it('accepts an empty order for an empty deck', async () => {
      mockFlashcardRepository.findByDeckId.mockResolvedValueOnce([]);

      await reorderFlashcardsUseCase.execute({
        deckId: 'deck-1',
        userId: 'user-1',
        orderedCardIds: [],
      });

      expect(mockFlashcardRepository.updatePositions).toHaveBeenCalledWith('deck-1', []);
    });
  });
});
