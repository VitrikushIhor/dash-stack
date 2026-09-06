import { SaveDeckEditorUseCase } from '../../../application/use-cases/save-deck-editor.use-case';
import { DeckRepositoryPort } from '../../../application/ports/deck-repository.port';
import { DeckEditorRepositoryPort } from '../../../application/ports/deck-editor-repository.port';
import { Deck } from '../../../domain/entities/deck.entity';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
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
    await useCase.execute({
      deckId: 'deck-1',
      userId: 'owner-1',
      metadata: { title: 'Updated title' },
      cards: [{ term: 'Term', definition: 'Definition' }],
      deletedCardIds: ['card-removed'],
    });

    expect(editorRepository.save).toHaveBeenCalledWith({
      deck: expect.objectContaining({ id: 'deck-1', title: 'Updated title' }),
      cards: [{ term: 'Term', definition: 'Definition' }],
      deletedCardIds: ['card-removed'],
    });
  });

  it('rejects a non-owner before the editor transaction', async () => {
    await expect(
      useCase.execute({
        deckId: 'deck-1',
        userId: 'other-user',
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
        metadata: {},
        cards: [],
        deletedCardIds: [],
      }),
    ).rejects.toThrow(DeckNotFoundException);
    expect(editorRepository.save).not.toHaveBeenCalled();
  });
});
