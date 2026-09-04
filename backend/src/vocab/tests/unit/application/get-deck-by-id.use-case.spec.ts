import { GetDeckByIdUseCase } from '../../../application/use-cases/get-deck-by-id.use-case';
import { DeckRepositoryPort } from '../../../application/ports/deck-repository.port';
import { Deck } from '../../../domain/entities/deck.entity';
import { DeckStatus, DeckVisibility } from '../../../domain/enums/vocab.enums';
import { DeckNotFoundException } from '../../../domain/exceptions/vocab-domain.exceptions';

describe('GetDeckByIdUseCase', () => {
  let useCase: GetDeckByIdUseCase;
  let deckRepository: jest.Mocked<DeckRepositoryPort>;

  beforeEach(() => {
    deckRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findMyDecks: jest.fn(),
      searchPublicDecks: jest.fn(),
      countFlashcardsByDeckId: jest.fn(),
      forkDeck: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new GetDeckByIdUseCase(deckRepository);
  });

  it('does not expose a public draft deck to a guest', async () => {
    deckRepository.findById.mockResolvedValue(
      Deck.create({
        id: 'deck-1',
        ownerUserId: 'owner-1',
        title: 'Unpublished deck',
        visibility: DeckVisibility.PUBLIC,
        status: DeckStatus.DRAFT,
      }),
    );

    await expect(useCase.execute({ deckId: 'deck-1', userId: null })).rejects.toThrow(
      DeckNotFoundException,
    );
  });
});
