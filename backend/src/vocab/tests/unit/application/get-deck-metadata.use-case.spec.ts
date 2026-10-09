import { DeckMetadataRepositoryPort } from '../../../application/ports/deck-repository.port';
import { GetDeckMetadataUseCase } from '../../../application/use-cases/get-deck-metadata.use-case';
import { Deck } from '../../../domain/entities/deck.entity';
import { DeckStatus, DeckVisibility } from '../../../domain/enums/vocab.enums';
import { DeckNotFoundException } from '../../../domain/exceptions/vocab-domain.exceptions';

describe('GetDeckMetadataUseCase', () => {
  const repository: jest.Mocked<DeckMetadataRepositoryPort> = {
    findMetadataById: jest.fn(),
  };
  const useCase = new GetDeckMetadataUseCase(repository);

  beforeEach(() => jest.clearAllMocks());

  it('should_return_metadata_when_the_deck_is_visible', async () => {
    const deck = Deck.create({
      id: 'deck-1',
      ownerUserId: 'owner-1',
      title: 'Deck',
      language: 'en',
      visibility: DeckVisibility.PUBLIC,
      status: DeckStatus.PUBLISHED,
    });

    repository.findMetadataById.mockResolvedValue(deck);

    await expect(useCase.execute({ deckId: 'deck-1', userId: null })).resolves.toBe(deck);
    expect(repository.findMetadataById).toHaveBeenCalledWith('deck-1');
  });

  it('should_hide_private_metadata_from_another_user', async () => {
    repository.findMetadataById.mockResolvedValue(
      Deck.create({
        id: 'deck-1',
        ownerUserId: 'owner-1',
        title: 'Deck',
        language: 'en',
        visibility: DeckVisibility.PRIVATE,
      }),
    );

    await expect(
      useCase.execute({ deckId: 'deck-1', userId: 'other-user' }),
    ).rejects.toBeInstanceOf(DeckNotFoundException);
  });
});
