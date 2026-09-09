import { GetStudyCardsUseCase } from '../../../application/use-cases/get-study-cards.use-case';
import { DeckRepositoryPort } from '../../../application/ports/deck-repository.port';
import { VocabProgressRepositoryPort } from '../../../application/ports/vocab-progress-repository.port';
import { Deck } from '../../../domain/entities/deck.entity';
import {
  DeckStatus,
  DeckType,
  DeckVisibility,
  VocabProgressStatus,
} from '../../../domain/enums/vocab.enums';
import {
  DeckNotFoundException,
  DeckAccessForbiddenException,
} from '../../../domain/exceptions/vocab-domain.exceptions';
import { StudyCardReadModel } from '../../../application/read-models/study-card.read-model';

describe('GetStudyCardsUseCase', () => {
  let useCase: GetStudyCardsUseCase;
  let mockDeckRepo: jest.Mocked<DeckRepositoryPort>;
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

    useCase = new GetStudyCardsUseCase(mockDeckRepo, mockVocabProgressRepo);
  });

  it('should throw DeckNotFoundException if deck does not exist', async () => {
    mockDeckRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 'user-1', deckId: 'non-existent' })).rejects.toThrow(
      DeckNotFoundException,
    );
  });

  it('should throw DeckAccessForbiddenException if private deck is accessed by non-owner', async () => {
    const deck = Deck.reconstitute({
      id: 'deck-1',
      ownerUserId: 'owner-user',
      title: 'Secret Notes',
      slug: 'secret-notes',
      description: null,
      language: 'en',
      level: null,
      tags: [],
      visibility: DeckVisibility.PRIVATE,
      status: DeckStatus.DRAFT,
      type: DeckType.USER_GENERATED,
      forkedFromDeckId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockDeckRepo.findById.mockResolvedValue(deck);

    await expect(useCase.execute({ userId: 'other-user', deckId: 'deck-1' })).rejects.toThrow(
      DeckAccessForbiddenException,
    );
  });

  it('should return study cards when authorized for public deck', async () => {
    const deck = Deck.reconstitute({
      id: 'deck-1',
      ownerUserId: 'owner-user',
      title: 'Public Oxford 3000',
      slug: 'oxford-3000',
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

    const expectedCards: StudyCardReadModel[] = [
      {
        id: 'card-1',
        deckId: 'deck-1',
        term: 'Ephemeral',
        definition: 'Lasting for a very short time',
        example: 'ephemeral beauty',
        imageUrl: null,
        position: 1,
        progress: {
          id: 'prog-1',
          status: VocabProgressStatus.LEARNING,
          box: 2,
          isStarred: true,
          correctStreak: 1,
          correctCount: 1,
          incorrectCount: 0,
          lastReviewedAt: new Date(),
          nextReviewAt: new Date(),
        },
      },
    ];

    mockDeckRepo.findById.mockResolvedValue(deck);
    mockVocabProgressRepo.getStudyCards.mockResolvedValue(expectedCards);

    const result = await useCase.execute({
      userId: 'guest-or-user',
      deckId: 'deck-1',
      onlyStarred: true,
    });

    expect(mockVocabProgressRepo.getStudyCards).toHaveBeenCalledWith('guest-or-user', 'deck-1', {
      onlyStarred: true,
      onlyDue: false,
    });
    expect(result).toEqual(expectedCards);
  });

  it('should reject a guest studying a public draft deck', async () => {
    mockDeckRepo.findById.mockResolvedValue(
      Deck.create({
        id: 'deck-1',
        ownerUserId: 'owner-user',
        title: 'Unpublished deck',
        visibility: DeckVisibility.PUBLIC,
        status: DeckStatus.DRAFT,
      }),
    );

    await expect(useCase.execute({ userId: null, deckId: 'deck-1' })).rejects.toThrow(
      DeckAccessForbiddenException,
    );
  });

  it('should reject a guest personalized due filter', async () => {
    mockDeckRepo.findById.mockResolvedValue(
      Deck.create({
        id: 'deck-1',
        ownerUserId: 'owner-user',
        title: 'Published deck',
        visibility: DeckVisibility.PUBLIC,
        status: DeckStatus.PUBLISHED,
      }),
    );

    await expect(
      useCase.execute({ userId: null, deckId: 'deck-1', onlyDue: true }),
    ).rejects.toThrow('Personalized study filters require authentication');
  });

  it('does not reveal a private deck through a guest personalized filter', async () => {
    mockDeckRepo.findById.mockResolvedValue(
      Deck.create({
        id: 'deck-1',
        ownerUserId: 'owner-user',
        title: 'Private deck',
        visibility: DeckVisibility.PRIVATE,
        status: DeckStatus.PUBLISHED,
      }),
    );

    await expect(
      useCase.execute({ userId: null, deckId: 'deck-1', onlyDue: true }),
    ).rejects.toThrow(DeckAccessForbiddenException);
  });
});
