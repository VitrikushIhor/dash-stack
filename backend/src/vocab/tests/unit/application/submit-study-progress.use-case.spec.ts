import { SubmitStudyProgressUseCase } from '../../../application/use-cases/submit-study-progress.use-case';
import { DeckRepositoryPort } from '../../../application/ports/deck-repository.port';
import { FlashcardRepositoryPort } from '../../../application/ports/flashcard-repository.port';
import { VocabProgressRepositoryPort } from '../../../application/ports/vocab-progress-repository.port';
import { Deck } from '../../../domain/entities/deck.entity';
import { Flashcard } from '../../../domain/entities/flashcard.entity';
import { VocabProgress } from '../../../domain/entities/vocab-progress.entity';
import {
  DeckStatus,
  DeckType,
  DeckVisibility,
  VocabProgressStatus,
} from '../../../domain/enums/vocab.enums';
import {
  DeckNotFoundException,
  FlashcardNotInDeckException,
  InvalidVocabProgressDataException,
  DeckAccessForbiddenException,
} from '../../../domain/exceptions/vocab-domain.exceptions';

describe('SubmitStudyProgressUseCase', () => {
  let useCase: SubmitStudyProgressUseCase;
  let mockDeckRepo: jest.Mocked<DeckRepositoryPort>;
  let mockFlashcardRepo: jest.Mocked<FlashcardRepositoryPort>;
  let mockVocabProgressRepo: jest.Mocked<VocabProgressRepositoryPort>;

  beforeEach(() => {
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

    mockVocabProgressRepo = {
      findByUserAndCard: jest.fn(),
      findByUserAndDeck: jest.fn(),
      findByUserAndCardIds: jest.fn(),
      getStudyCards: jest.fn(),
      browseDeckCards: jest.fn(),
      getDueReviews: jest.fn(),
      save: jest.fn(),
      upsertBatch: jest.fn(),
    };

    useCase = new SubmitStudyProgressUseCase({
      run: (work) =>
        work({
          studyAttemptRepository: { find: jest.fn(), save: jest.fn() },
          deckRepository: mockDeckRepo,
          flashcardRepository: mockFlashcardRepo,
          vocabProgressRepository: mockVocabProgressRepo,
        }),
    });
  });

  it('should throw InvalidVocabProgressDataException when results is empty', async () => {
    await expect(
      useCase.execute({ userId: 'user-1', deckId: 'deck-1', results: [] }),
    ).rejects.toThrow(InvalidVocabProgressDataException);
  });

  it.each([true, false])(
    'should_reject_duplicate_card_ids_when_answers_match_or_conflict_%s',
    async (isCorrect) => {
      mockDeckRepo.findById.mockResolvedValue(
        Deck.create({ id: 'deck-1', ownerUserId: 'user-1', title: 'Deck' }),
      );
      mockFlashcardRepo.findByDeckId.mockResolvedValue([
        Flashcard.create({
          id: 'card-1',
          deckId: 'deck-1',
          term: 'Term',
          definition: 'Definition',
          position: 0,
        }),
      ]);
      mockVocabProgressRepo.findByUserAndCardIds.mockResolvedValue([]);
      mockVocabProgressRepo.upsertBatch.mockImplementation(async (entities) => entities);
      await expect(
        useCase.execute({
          userId: 'user-1',
          deckId: 'deck-1',
          results: [
            { flashcardId: 'card-1', isCorrect: true },
            { flashcardId: 'card-1', isCorrect },
          ],
        }),
      ).rejects.toThrow(InvalidVocabProgressDataException);
      expect(mockVocabProgressRepo.upsertBatch).not.toHaveBeenCalled();
    },
  );

  it('should throw DeckNotFoundException when deck is missing', async () => {
    mockDeckRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        deckId: 'non-existent',
        results: [{ flashcardId: 'card-1', isCorrect: true }],
      }),
    ).rejects.toThrow(DeckNotFoundException);
  });

  it('should throw FlashcardNotInDeckException when a card does not belong to the deck', async () => {
    const deck = Deck.reconstitute({
      id: 'deck-1',
      ownerUserId: 'user-1',
      title: 'My Deck',
      slug: 'my-deck',
      description: null,
      language: 'en',
      level: null,
      tags: [],
      visibility: DeckVisibility.PUBLIC,
      status: DeckStatus.PUBLISHED,
      type: DeckType.USER_GENERATED,
      forkedFromDeckId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const card1 = Flashcard.reconstitute({
      id: 'card-1',
      deckId: 'deck-1',
      term: 'Apple',
      definition: 'Fruit',
      example: null,
      imageUrl: null,
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockDeckRepo.findById.mockResolvedValue(deck);
    mockFlashcardRepo.findByDeckId.mockResolvedValue([card1]);

    await expect(
      useCase.execute({
        userId: 'user-1',
        deckId: 'deck-1',
        results: [
          { flashcardId: 'card-1', isCorrect: true },
          { flashcardId: 'alien-card-99', isCorrect: false },
        ],
      }),
    ).rejects.toThrow(FlashcardNotInDeckException);
  });

  it('should process new and existing cards, updating Leitner SRS values and persisting them', async () => {
    const deck = Deck.reconstitute({
      id: 'deck-1',
      ownerUserId: 'user-1',
      title: 'My Deck',
      slug: 'my-deck',
      description: null,
      language: 'en',
      level: null,
      tags: [],
      visibility: DeckVisibility.PUBLIC,
      status: DeckStatus.PUBLISHED,
      type: DeckType.USER_GENERATED,
      forkedFromDeckId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const card1 = Flashcard.reconstitute({
      id: 'card-1',
      deckId: 'deck-1',
      term: 'Apple',
      definition: 'Fruit',
      example: null,
      imageUrl: null,
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const card2 = Flashcard.reconstitute({
      id: 'card-2',
      deckId: 'deck-1',
      term: 'Banana',
      definition: 'Yellow fruit',
      example: null,
      imageUrl: null,
      position: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const existingProg2 = VocabProgress.reconstitute({
      id: 'prog-2',
      userId: 'user-1',
      deckId: 'deck-1',
      flashcardId: 'card-2',
      status: VocabProgressStatus.KNOWN,
      box: 3,
      isStarred: false,
      correctStreak: 3,
      correctCount: 3,
      incorrectCount: 0,
      lastReviewedAt: new Date('2026-08-20'),
      nextReviewAt: new Date('2026-08-27'),
      createdAt: new Date('2026-08-20'),
      updatedAt: new Date('2026-08-20'),
    });

    mockDeckRepo.findById.mockResolvedValue(deck);
    mockFlashcardRepo.findByDeckId.mockResolvedValue([card1, card2]);
    mockVocabProgressRepo.findByUserAndCardIds.mockResolvedValue([existingProg2]);
    mockVocabProgressRepo.upsertBatch.mockImplementation(async (entities) => entities);

    const result = await useCase.execute({
      userId: 'user-1',
      deckId: 'deck-1',
      results: [
        { flashcardId: 'card-1', isCorrect: true },
        { flashcardId: 'card-2', isCorrect: false },
      ],
    });

    expect(mockVocabProgressRepo.upsertBatch).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);

    // Card 1 was NEW, answered correctly -> box 2, streak 1
    const resCard1 = result.find((r) => r.flashcardId === 'card-1');
    expect(resCard1).toBeDefined();
    expect(resCard1!.box).toBe(2);
    expect(resCard1!.correctStreak).toBe(1);
    expect(resCard1!.correctCount).toBe(1);
    expect(resCard1!.status).toBe(VocabProgressStatus.LEARNING);

    // Card 2 was Box 3, answered incorrectly -> reset to box 1, streak 0, status FORGOTTEN
    const resCard2 = result.find((r) => r.flashcardId === 'card-2');
    expect(resCard2).toBeDefined();
    expect(resCard2!.box).toBe(1);
    expect(resCard2!.correctStreak).toBe(0);
    expect(resCard2!.incorrectCount).toBe(1);
    expect(resCard2!.status).toBe(VocabProgressStatus.FORGOTTEN);
  });

  it('should reject progress submission for an archived public deck by a non-owner', async () => {
    mockDeckRepo.findById.mockResolvedValue(
      Deck.create({
        id: 'deck-1',
        ownerUserId: 'owner-user',
        title: 'Archived deck',
        visibility: DeckVisibility.PUBLIC,
        status: DeckStatus.ARCHIVED,
      }),
    );

    await expect(
      useCase.execute({
        userId: 'user-2',
        deckId: 'deck-1',
        results: [{ flashcardId: 'card-1', isCorrect: true }],
      }),
    ).rejects.toThrow(DeckAccessForbiddenException);
  });
});
