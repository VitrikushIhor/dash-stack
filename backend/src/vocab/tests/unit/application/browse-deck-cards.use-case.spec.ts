import { BrowseDeckCardsUseCase } from '../../../application/use-cases/browse-deck-cards.use-case';
import { DeckRepositoryPort } from '../../../application/ports/deck-repository.port';
import { VocabProgressRepositoryPort } from '../../../application/ports/vocab-progress-repository.port';
import { Deck } from '../../../domain/entities/deck.entity';
import { DeckStatus, DeckVisibility } from '../../../domain/enums/vocab.enums';
import { DeckAccessForbiddenException } from '../../../domain/exceptions/vocab-domain.exceptions';

describe('BrowseDeckCardsUseCase', () => {
  const deckRepository = { findById: jest.fn() } as unknown as jest.Mocked<DeckRepositoryPort>;
  const progressRepository = {
    browseDeckCards: jest.fn(),
  } as unknown as jest.Mocked<VocabProgressRepositoryPort>;
  const useCase = new BrowseDeckCardsUseCase(deckRepository, progressRepository);

  beforeEach(() => jest.clearAllMocks());

  it('should_search_paginated_cards_when_deck_is_accessible', async () => {
    deckRepository.findById.mockResolvedValue(
      Deck.create({
        id: 'deck-1',
        ownerUserId: 'owner-1',
        title: 'Public deck',
        visibility: DeckVisibility.PUBLIC,
        status: DeckStatus.PUBLISHED,
      }),
    );
    const expected = {
      data: [],
      meta: {
        total: 0,
        lastPage: 1,
        currentPage: 2,
        perPage: 25,
        prev: 1,
        next: null,
      },
      summary: { total: 100, due: 3, starred: 4, dueAndStarred: 1 },
    };
    progressRepository.browseDeckCards.mockResolvedValue(expected);

    await expect(
      useCase.execute({
        deckId: 'deck-1',
        userId: 'user-1',
        search: 'deploy',
        page: 2,
        perPage: 25,
      }),
    ).resolves.toEqual(expected);
    expect(progressRepository.browseDeckCards).toHaveBeenCalledWith('user-1', 'deck-1', {
      search: 'deploy',
      page: 2,
      perPage: 25,
    });
  });

  it('should_reject_non_owner_access_to_private_deck', async () => {
    deckRepository.findById.mockResolvedValue(
      Deck.create({
        id: 'deck-1',
        ownerUserId: 'owner-1',
        title: 'Private deck',
        visibility: DeckVisibility.PRIVATE,
        status: DeckStatus.PUBLISHED,
      }),
    );

    await expect(
      useCase.execute({
        deckId: 'deck-1',
        userId: 'other-user',
        page: 1,
        perPage: 50,
      }),
    ).rejects.toBeInstanceOf(DeckAccessForbiddenException);
    expect(progressRepository.browseDeckCards).not.toHaveBeenCalled();
  });
});
