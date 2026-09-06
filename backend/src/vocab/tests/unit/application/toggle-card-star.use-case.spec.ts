import { ToggleCardStarUseCase } from '../../../application/use-cases/toggle-card-star.use-case';
import { FlashcardRepositoryPort } from '../../../application/ports/flashcard-repository.port';
import { DeckRepositoryPort } from '../../../application/ports/deck-repository.port';
import { VocabProgressRepositoryPort } from '../../../application/ports/vocab-progress-repository.port';
import { Flashcard } from '../../../domain/entities/flashcard.entity';
import { Deck } from '../../../domain/entities/deck.entity';
import { VocabProgress } from '../../../domain/entities/vocab-progress.entity';
import { DeckStatus, DeckVisibility, VocabProgressStatus } from '../../../domain/enums/vocab.enums';
import {
  DeckAccessForbiddenException,
  FlashcardNotFoundException,
} from '../../../domain/exceptions/vocab-domain.exceptions';

describe('ToggleCardStarUseCase', () => {
  let useCase: ToggleCardStarUseCase;
  let mockFlashcardRepo: jest.Mocked<FlashcardRepositoryPort>;
  let mockDeckRepo: jest.Mocked<DeckRepositoryPort>;
  let mockVocabProgressRepo: jest.Mocked<VocabProgressRepositoryPort>;

  beforeEach(() => {
    mockFlashcardRepo = {
      save: jest.fn(),
      saveMany: jest.fn(),
      findById: jest.fn(),
      findByDeckId: jest.fn(),
      getMaxPositionByDeckId: jest.fn(),
      updatePositions: jest.fn(),
      delete: jest.fn(),
      deleteAndDemotePublishedDeckIfBelowMinimum: jest.fn(),
    };

    mockDeckRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findMyDecks: jest.fn(),
      searchPublicDecks: jest.fn(),
      countFlashcardsByDeckId: jest.fn(),
      forkDeck: jest.fn(),
      delete: jest.fn(),
    };
    mockDeckRepo.findById.mockResolvedValue(
      Deck.create({
        id: 'deck-1',
        ownerUserId: 'owner-1',
        title: 'Published deck',
        visibility: DeckVisibility.PUBLIC,
        status: DeckStatus.PUBLISHED,
      }),
    );

    mockVocabProgressRepo = {
      findByUserAndCard: jest.fn(),
      findByUserAndDeck: jest.fn(),
      findByUserAndCardIds: jest.fn(),
      getStudyCards: jest.fn(),
      getDueReviews: jest.fn(),
      save: jest.fn(),
      upsertBatch: jest.fn(),
    };

    useCase = new ToggleCardStarUseCase(mockFlashcardRepo, mockDeckRepo, mockVocabProgressRepo);
  });

  it('should throw FlashcardNotFoundException if card does not exist', async () => {
    mockFlashcardRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: 'user-1', flashcardId: 'non-existent' }),
    ).rejects.toThrow(FlashcardNotFoundException);
  });

  it('should create a new progress record with isStarred: true if none exists', async () => {
    const card = Flashcard.reconstitute({
      id: 'card-1',
      deckId: 'deck-1',
      term: 'Word',
      definition: 'Meaning',
      example: null,
      imageUrl: null,
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockFlashcardRepo.findById.mockResolvedValue(card);
    mockVocabProgressRepo.findByUserAndCard.mockResolvedValue(null);
    mockVocabProgressRepo.save.mockImplementation(async (p) => p);

    const result = await useCase.execute({ userId: 'user-1', flashcardId: 'card-1' });

    expect(mockVocabProgressRepo.save).toHaveBeenCalledTimes(1);
    expect(result.flashcardId).toBe('card-1');
    expect(result.isStarred).toBe(true);
  });

  it('should toggle star from true to false for an existing progress record', async () => {
    const card = Flashcard.reconstitute({
      id: 'card-1',
      deckId: 'deck-1',
      term: 'Word',
      definition: 'Meaning',
      example: null,
      imageUrl: null,
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const existingProgress = VocabProgress.reconstitute({
      id: 'prog-1',
      userId: 'user-1',
      deckId: 'deck-1',
      flashcardId: 'card-1',
      status: VocabProgressStatus.LEARNING,
      box: 2,
      isStarred: true,
      correctStreak: 1,
      correctCount: 1,
      incorrectCount: 0,
      lastReviewedAt: new Date(),
      nextReviewAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockFlashcardRepo.findById.mockResolvedValue(card);
    mockVocabProgressRepo.findByUserAndCard.mockResolvedValue(existingProgress);
    mockVocabProgressRepo.save.mockImplementation(async (p) => p);

    const result = await useCase.execute({ userId: 'user-1', flashcardId: 'card-1' });

    expect(mockVocabProgressRepo.save).toHaveBeenCalledTimes(1);
    expect(result.flashcardId).toBe('card-1');
    expect(result.isStarred).toBe(false);
  });

  it('should reject a non-owner attempting to star a private deck card', async () => {
    const card = Flashcard.reconstitute({
      id: 'card-1',
      deckId: 'private-deck-1',
      term: 'Secret',
      definition: 'Private meaning',
      example: null,
      imageUrl: null,
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockFlashcardRepo.findById.mockResolvedValue(card);
    mockDeckRepo.findById.mockResolvedValue(
      Deck.create({
        id: 'private-deck-1',
        ownerUserId: 'owner-1',
        title: 'Private deck',
        visibility: DeckVisibility.PRIVATE,
        status: DeckStatus.PUBLISHED,
      }),
    );

    await expect(useCase.execute({ userId: 'user-2', flashcardId: 'card-1' })).rejects.toThrow(
      DeckAccessForbiddenException,
    );
    expect(mockVocabProgressRepo.save).not.toHaveBeenCalled();
  });
});
