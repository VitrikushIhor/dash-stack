import { CreateMatchSessionUseCase } from '../../../application/use-cases/create-match-session.use-case';
import { MatchRepositoryPort } from '../../../application/ports/match-repository.port';
import { MatchSession } from '../../../domain/entities/match-session.entity';
import { Deck } from '../../../domain/entities/deck.entity';
import { DeckStatus, DeckVisibility } from '../../../domain/enums/vocab.enums';
import {
  InvalidMatchSessionException,
  MatchAuthenticationRequiredException,
} from '../../../domain/exceptions/match-domain.exceptions';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
} from '../../../domain/exceptions/vocab-domain.exceptions';

const now = new Date('2026-09-09T10:00:00.000Z');

describe('CreateMatchSessionUseCase', () => {
  let repository: jest.Mocked<MatchRepositoryPort>;
  let deck: Deck | null;
  let useCase: CreateMatchSessionUseCase;

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
    repository.selectCards.mockResolvedValue(
      Array.from({ length: 6 }, (_, index) => ({
        id: `card-${index}`,
        deckId: 'deck-1',
        term: `Term ${index}`,
        definition: `Definition ${index}`,
      })),
    );
    repository.createSession.mockImplementation(async (session) =>
      MatchSession.reconstitute({ ...session.toSnapshot(), id: 'session-1' }),
    );
    useCase = new CreateMatchSessionUseCase(
      {
        run: (work) =>
          work({ deckRepository: { findById: async () => deck }, matchRepository: repository }),
      },
      { now: () => new Date(now) },
    );
  });

  it.each([undefined, null, ''])('should_reject_creation_when_user_is_%s', async (userId) => {
    await expect(useCase.execute({ deckId: 'deck-1', userId })).rejects.toThrow(
      MatchAuthenticationRequiredException,
    );
    expect(repository.createSession).not.toHaveBeenCalled();
  });

  it('should_return_not_found_when_deck_is_missing', async () => {
    deck = null;
    await expect(useCase.execute({ deckId: 'deck-1', userId: 'owner' })).rejects.toThrow(
      DeckNotFoundException,
    );
    expect(repository.createSession).not.toHaveBeenCalled();
  });

  it.each(
    Object.values(DeckStatus).flatMap((status) =>
      Object.values(DeckVisibility).flatMap((visibility) =>
        ['owner', 'other-user'].map((userId) => ({ status, visibility, userId })),
      ),
    ),
  )(
    'should_enforce_study_access_when_$status/$visibility/$userId',
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
        await expect(result).resolves.toMatchObject({ id: 'session-1', deckId: 'deck-1' });
      } else {
        await expect(result).rejects.toThrow(DeckAccessForbiddenException);
        expect(repository.selectCards).not.toHaveBeenCalled();
        expect(repository.createSession).not.toHaveBeenCalled();
      }
    },
  );

  it.each([0, 5])('should_reject_creation_when_selection_contains_%i_cards', async (count) => {
    repository.selectCards.mockResolvedValue(
      Array.from({ length: count }, (_, index) => ({
        id: `card-${index}`,
        deckId: 'deck-1',
        term: 'Term',
        definition: 'Definition',
      })),
    );
    await expect(useCase.execute({ deckId: 'deck-1', userId: 'owner' })).rejects.toThrow(
      InvalidMatchSessionException,
    );
    expect(repository.createSession).not.toHaveBeenCalled();
  });

  it('should_reject_creation_when_selection_contains_a_foreign_card', async () => {
    repository.selectCards.mockResolvedValue(
      Array.from({ length: 6 }, (_, index) => ({
        id: `card-${index}`,
        deckId: index === 0 ? 'other-deck' : 'deck-1',
        term: 'Term',
        definition: 'Definition',
      })),
    );
    await expect(useCase.execute({ deckId: 'deck-1', userId: 'owner' })).rejects.toThrow(
      InvalidMatchSessionException,
    );
    expect(repository.createSession).not.toHaveBeenCalled();
  });

  it('should_store_selected_cards_and_server_time_when_personalized_filters_are_requested', async () => {
    const result = await useCase.execute({
      deckId: 'deck-1',
      userId: 'owner',
      onlyDue: true,
      onlyStarred: true,
    });

    expect(repository.selectCards).toHaveBeenCalledWith({
      deckId: 'deck-1',
      userId: 'owner',
      onlyDue: true,
      onlyStarred: true,
      now,
      limit: 12,
    });
    expect(result).toEqual({
      id: 'session-1',
      deckId: 'deck-1',
      startedAt: now,
      expiresAt: new Date('2026-09-09T10:30:00.000Z'),
      cards: Array.from({ length: 6 }, (_, index) => ({
        id: `card-${index}`,
        deckId: 'deck-1',
        term: `Term ${index}`,
        definition: `Definition ${index}`,
      })),
    });
    expect(repository.createSession.mock.calls[0][0].toSnapshot()).toMatchObject({
      userId: 'owner',
      selectedCardIds: result.cards.map((card) => card.id),
      startedAt: now,
    });
  });
});
