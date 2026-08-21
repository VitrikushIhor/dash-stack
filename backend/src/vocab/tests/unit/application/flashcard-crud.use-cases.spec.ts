import { CreateFlashcardUseCase } from '../../../application/use-cases/create-flashcard.use-case';
import { UpdateFlashcardUseCase } from '../../../application/use-cases/update-flashcard.use-case';
import { DeleteFlashcardUseCase } from '../../../application/use-cases/delete-flashcard.use-case';
import { ReorderFlashcardsUseCase } from '../../../application/use-cases/reorder-flashcards.use-case';
import { DeckRepositoryPort } from '../../../application/ports/deck-repository.port';
import { FlashcardRepositoryPort } from '../../../application/ports/flashcard-repository.port';
import { Deck } from '../../../domain/entities/deck.entity';
import { Flashcard } from '../../../domain/entities/flashcard.entity';
import { DeckStatus } from '../../../domain/enums/vocab.enums';
import {
  DeckAccessForbiddenException,
  FlashcardNotFoundException,
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

      expect(mockFlashcardRepository.delete).toHaveBeenCalledWith('card-1');
    });

    it('should demote PUBLISHED deck to DRAFT when card count falls below 2 after deletion', async () => {
      const publishedDeck = Deck.create({
        id: 'deck-published',
        ownerUserId: 'user-1',
        title: 'Published Deck',
        status: DeckStatus.PUBLISHED,
      });
      mockDeckRepository.findById.mockResolvedValueOnce(publishedDeck);

      const card = Flashcard.create({
        id: 'card-1',
        deckId: 'deck-published',
        term: 'Term',
        definition: 'Def',
        position: 1,
      });
      mockFlashcardRepository.findById.mockResolvedValueOnce(card);
      mockDeckRepository.countFlashcardsByDeckId.mockResolvedValueOnce(1); // Only 1 card left

      await deleteFlashcardUseCase.execute({
        deckId: 'deck-published',
        cardId: 'card-1',
        userId: 'user-1',
      });

      expect(mockFlashcardRepository.delete).toHaveBeenCalledWith('card-1');
      expect(publishedDeck.status).toBe(DeckStatus.DRAFT);
      expect(mockDeckRepository.save).toHaveBeenCalledWith(publishedDeck);
    });
  });

  describe('ReorderFlashcardsUseCase', () => {
    it('should reorder cards in deck', async () => {
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
  });
});
