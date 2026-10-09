import { GetMatchLeaderboardUseCase } from '../../../application/use-cases/get-match-leaderboard.use-case';
import { MatchRepositoryPort } from '../../../application/ports/match-repository.port';
import { MatchLeaderboardReadModel } from '../../../application/read-models/match.read-model';
import { Deck } from '../../../domain/entities/deck.entity';
import { DeckStatus, DeckVisibility } from '../../../domain/enums/vocab.enums';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
} from '../../../domain/exceptions/vocab-domain.exceptions';

describe('GetMatchLeaderboardUseCase', () => {
  let repository: jest.Mocked<MatchRepositoryPort>;
  let deck: Deck | null;
  let useCase: GetMatchLeaderboardUseCase;
  const emptyBoard: MatchLeaderboardReadModel = {
    data: [],
    currentUserBest: null,
    meta: { total: 0, lastPage: 1, currentPage: 1, perPage: 10, prev: null, next: null },
  };

  beforeEach(() => {
    deck = Deck.create({ id: 'deck-1', ownerUserId: 'owner', title: 'Match' });
    repository = {
      selectCards: jest.fn(),
      createSession: jest.fn(),
      findSession: jest.fn(),
      completeSession: jest.fn(),
      recordMatchedPair: jest.fn(),
      findBest: jest.fn(),
      saveBest: jest.fn(),
      getLeaderboard: jest.fn(),
    };
    repository.getLeaderboard.mockResolvedValue(emptyBoard);
    useCase = new GetMatchLeaderboardUseCase({
      run: (work) =>
        work({ deckRepository: { findById: async () => deck }, matchRepository: repository }),
    });
  });

  it.each(
    Object.values(DeckStatus).flatMap((status) =>
      Object.values(DeckVisibility).flatMap((visibility) =>
        ['owner', 'other-user', null].map((userId) => ({ status, visibility, userId })),
      ),
    ),
  )(
    'should_enforce_view_access_when_$status/$visibility/$userId',
    async ({ status, visibility, userId }) => {
      deck = Deck.create({
        id: 'deck-1',
        ownerUserId: 'owner',
        title: 'Match',
        status,
        visibility,
      });
      const allowed =
        userId === 'owner' ||
        (status === DeckStatus.PUBLISHED && visibility !== DeckVisibility.PRIVATE);
      const result = useCase.execute({ deckId: 'deck-1', userId });

      if (allowed) {
        await expect(result).resolves.toEqual(emptyBoard);
      } else {
        await expect(result).rejects.toThrow(DeckAccessForbiddenException);
        expect(repository.getLeaderboard).not.toHaveBeenCalled();
      }
    },
  );

  it('should_return_not_found_when_deck_does_not_exist', async () => {
    deck = null;
    await expect(useCase.execute({ deckId: 'missing' })).rejects.toThrow(DeckNotFoundException);
    expect(repository.getLeaderboard).not.toHaveBeenCalled();
  });

  it('should_return_personal_best_outside_page_when_requesting_paginated_results', async () => {
    const currentUserBest = {
      id: 'best-1',
      deckId: 'deck-1',
      userId: 'owner',
      durationMs: 14500,
      cardCount: 6,
      createdAt: new Date('2026-09-09T10:00:14.500Z'),
      user: { id: 'owner', firstName: 'Learner', lastName: null, avatar: null },
    };
    repository.getLeaderboard.mockResolvedValue({ ...emptyBoard, currentUserBest });
    const query = { deckId: 'deck-1', userId: 'owner', page: 2, perPage: 5 };

    const result = await useCase.execute(query);

    expect(result.currentUserBest).toEqual(currentUserBest);
    expect(result.data).toEqual([]);
    expect(repository.getLeaderboard).toHaveBeenCalledWith(query);
  });

  it('should_surface_failure_when_leaderboard_cannot_be_loaded', async () => {
    repository.getLeaderboard.mockRejectedValue(new Error('Database unavailable'));
    await expect(useCase.execute({ deckId: 'deck-1', userId: 'owner' })).rejects.toThrow(
      'Database unavailable',
    );
  });
});
