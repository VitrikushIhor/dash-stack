import { ForkDeckUseCase } from '../../../application/use-cases/fork-deck.use-case';
import { DeckRepositoryPort } from '../../../application/ports/deck-repository.port';
import { Deck } from '../../../domain/entities/deck.entity';
import { DeckStatus, DeckVisibility } from '../../../domain/enums/vocab.enums';
import { DeckNotFoundException } from '../../../domain/exceptions/vocab-domain.exceptions';

describe('ForkDeckUseCase', () => {
  let useCase: ForkDeckUseCase;
  let mockDeckRepository: jest.Mocked<DeckRepositoryPort>;

  const originalDeck = Deck.create({
    id: 'orig-deck-1',
    ownerUserId: 'original-owner-123',
    title: 'Advanced Idioms',
    slug: 'advanced-idioms',
    description: 'A great deck of idioms',
    language: 'en',
    tags: ['idioms', 'c1'],
    visibility: DeckVisibility.PUBLIC,
    status: DeckStatus.PUBLISHED,
    cardCount: 2,
  });

  beforeEach(() => {
    mockDeckRepository = {
      save: jest.fn(),
      updateMetadata: jest.fn(),
      publish: jest.fn(),
      findForAccess: jest.fn(),
      findById: jest.fn().mockImplementation((id: string) => {
        if (id === 'orig-deck-1') return Promise.resolve(originalDeck);

        return Promise.resolve(null);
      }),
      findBySlug: jest.fn().mockResolvedValue(null),
      findMyDecks: jest.fn().mockResolvedValue([]),
      searchPublicDecks: jest.fn().mockResolvedValue({
        data: [],
        total: 0,
        lastPage: 1,
        currentPage: 1,
        perPage: 10,
        prev: null,
        next: null,
      }),
      countFlashcardsByDeckId: jest.fn().mockResolvedValue(2),
      forkDeck: jest.fn().mockImplementation((sourceId: string, forkedDeck: Deck) => {
        return Promise.resolve(
          Deck.reconstitute({
            id: 'forked-deck-123',
            ownerUserId: forkedDeck.ownerUserId,
            title: forkedDeck.title,
            slug: forkedDeck.slug,
            description: forkedDeck.description,
            language: forkedDeck.language,
            level: forkedDeck.level,
            tags: forkedDeck.tags,
            visibility: forkedDeck.visibility,
            status: forkedDeck.status,
            type: forkedDeck.type,
            forkedFromDeckId: sourceId,
            cardCount: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        );
      }),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new ForkDeckUseCase(mockDeckRepository);
  });

  it('should successfully fork a public deck with atomic transaction into user library', async () => {
    const result = await useCase.execute({
      deckId: 'orig-deck-1',
      targetUserId: 'new-user-456',
    });

    expect(result.ownerUserId).toBe('new-user-456');
    expect(result.title).toBe('Copy of Advanced Idioms');
    expect(result.forkedFromDeckId).toBe('orig-deck-1');
    expect(result.status).toBe(DeckStatus.DRAFT);
    expect(result.visibility).toBe(DeckVisibility.PRIVATE);
    expect(result.cardCount).toBe(2);

    expect(mockDeckRepository.forkDeck).toHaveBeenCalledTimes(1);
    expect(mockDeckRepository.forkDeck).toHaveBeenCalledWith('orig-deck-1', expect.any(Deck));
  });

  it('should throw DeckNotFoundException when source deck does not exist', async () => {
    mockDeckRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        deckId: 'non-existent',
        targetUserId: 'user-1',
      }),
    ).rejects.toThrow(DeckNotFoundException);
  });

  it('should throw DeckNotFoundException when source deck is private and not owned by requester', async () => {
    const privateDeck = Deck.create({
      id: 'private-deck-1',
      ownerUserId: 'secret-owner',
      title: 'Secret Notes',
      visibility: DeckVisibility.PRIVATE,
      status: DeckStatus.DRAFT,
    });
    mockDeckRepository.findById.mockResolvedValue(privateDeck);

    await expect(
      useCase.execute({
        deckId: 'private-deck-1',
        targetUserId: 'unauthorized-user',
      }),
    ).rejects.toThrow(DeckNotFoundException);
  });

  it('should not fork a public draft deck as a non-owner', async () => {
    mockDeckRepository.findById.mockResolvedValue(
      Deck.create({
        id: 'draft-deck-1',
        ownerUserId: 'owner-1',
        title: 'Unpublished deck',
        visibility: DeckVisibility.PUBLIC,
        status: DeckStatus.DRAFT,
      }),
    );

    await expect(
      useCase.execute({ deckId: 'draft-deck-1', targetUserId: 'user-2' }),
    ).rejects.toThrow(DeckNotFoundException);
  });
});
