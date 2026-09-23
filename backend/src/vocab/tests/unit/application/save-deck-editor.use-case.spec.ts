import { SaveDeckEditorUseCase } from '../../../application/use-cases/save-deck-editor.use-case';
import { DeckRepositoryPort } from '../../../application/ports/deck-repository.port';
import { DeckEditorRepositoryPort } from '../../../application/ports/deck-editor-repository.port';
import { Deck } from '../../../domain/entities/deck.entity';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
  InvalidFlashcardDataException,
} from '../../../domain/exceptions/vocab-domain.exceptions';

describe('SaveDeckEditorUseCase', () => {
  const deck = Deck.create({
    id: 'deck-1',
    ownerUserId: 'owner-1',
    title: 'Original title',
  });
  let deckRepository: jest.Mocked<DeckRepositoryPort>;
  let editorRepository: jest.Mocked<DeckEditorRepositoryPort>;
  let useCase: SaveDeckEditorUseCase;

  beforeEach(() => {
    deckRepository = {
      save: jest.fn(),
      updateMetadata: jest.fn(),
      publish: jest.fn(),
      findForAccess: jest.fn(),
      findById: jest.fn().mockResolvedValue(deck),
      findBySlug: jest.fn(),
      findMyDecks: jest.fn(),
      searchPublicDecks: jest.fn(),
      countFlashcardsByDeckId: jest.fn(),
      forkDeck: jest.fn(),
      delete: jest.fn(),
    };
    editorRepository = { save: jest.fn().mockResolvedValue(deck) };
    useCase = new SaveDeckEditorUseCase(deckRepository, editorRepository);
  });

  it('saves owner metadata and the complete editor snapshot through one repository command', async () => {
    const expectedUpdatedAt = deck.updatedAt.toISOString();

    await useCase.execute({
      deckId: 'deck-1',
      userId: 'owner-1',
      operationId: '7d44c28b-e870-42c6-bd8f-70a702513d9c',
      expectedUpdatedAt,
      metadata: { title: 'Updated title' },
      cards: [{ term: 'Term', definition: 'Definition' }],
      deletedCardIds: ['card-removed'],
    });

    expect(editorRepository.save).toHaveBeenCalledWith({
      deck: expect.objectContaining({ id: 'deck-1', title: 'Updated title' }),
      userId: 'owner-1',
      operationId: '7d44c28b-e870-42c6-bd8f-70a702513d9c',
      payloadHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      expectedUpdatedAt: new Date(expectedUpdatedAt),
      cards: [{ term: 'Term', definition: 'Definition' }],
      deletedCardIds: ['card-removed'],
    });
  });

  it('rejects a non-owner before the editor transaction', async () => {
    await expect(
      useCase.execute({
        deckId: 'deck-1',
        userId: 'other-user',
        operationId: '7d44c28b-e870-42c6-bd8f-70a702513d9c',
        expectedUpdatedAt: deck.updatedAt.toISOString(),
        metadata: {},
        cards: [],
        deletedCardIds: [],
      }),
    ).rejects.toThrow(DeckAccessForbiddenException);
    expect(editorRepository.save).not.toHaveBeenCalled();
  });

  it('rejects a missing deck before the editor transaction', async () => {
    deckRepository.findById.mockResolvedValueOnce(null);

    await expect(
      useCase.execute({
        deckId: 'missing',
        userId: 'owner-1',
        operationId: '7d44c28b-e870-42c6-bd8f-70a702513d9c',
        expectedUpdatedAt: deck.updatedAt.toISOString(),
        metadata: {},
        cards: [],
        deletedCardIds: [],
      }),
    ).rejects.toThrow(DeckNotFoundException);
    expect(editorRepository.save).not.toHaveBeenCalled();
  });

  it('rejects an invalid card before the editor transaction', async () => {
    await expect(
      useCase.execute({
        deckId: 'deck-1',
        userId: 'owner-1',
        operationId: '7d44c28b-e870-42c6-bd8f-70a702513d9c',
        expectedUpdatedAt: deck.updatedAt.toISOString(),
        metadata: {},
        cards: [{ term: '', definition: 'Definition' }],
        deletedCardIds: [],
      }),
    ).rejects.toThrow(InvalidFlashcardDataException);
    expect(editorRepository.save).not.toHaveBeenCalled();
  });
});
