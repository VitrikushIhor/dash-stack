import { CompleteMatchSessionUseCase } from '../../../application/use-cases/complete-match-session.use-case';
import { MatchRepositoryPort } from '../../../application/ports/match-repository.port';
import { MatchLeaderboardEntryReadModel } from '../../../application/read-models/match.read-model';
import { MatchSession } from '../../../domain/entities/match-session.entity';
import { Deck } from '../../../domain/entities/deck.entity';
import { DeckStatus, DeckVisibility } from '../../../domain/enums/vocab.enums';
import {
  MatchAuthenticationRequiredException,
  MatchSessionExpiredException,
  MatchSessionNotFoundException,
} from '../../../domain/exceptions/match-domain.exceptions';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
} from '../../../domain/exceptions/vocab-domain.exceptions';

const startedAt = new Date('2026-09-09T10:00:00.000Z');
const completedAt = new Date('2026-09-09T10:00:14.500Z');
const user = { id: 'owner', firstName: 'Learner', lastName: null, avatar: null };
const command = { deckId: 'deck-1', userId: 'owner', sessionId: 'session-1' };

describe('CompleteMatchSessionUseCase', () => {
  let repository: jest.Mocked<MatchRepositoryPort>;
  let deck: Deck | null;
  let session: MatchSession;
  let now: Date;
  let useCase: CompleteMatchSessionUseCase;

  beforeEach(() => {
    now = completedAt;
    deck = Deck.create({ id: 'deck-1', ownerUserId: 'owner', title: 'Match' });
    session = MatchSession.reconstitute({
      ...MatchSession.create(
        {
          deckId: 'deck-1',
          userId: 'owner',
          selectedCardIds: Array.from({ length: 6 }, (_, index) => `card-${index}`),
        },
        startedAt,
      ).toSnapshot(),
      id: 'session-1',
      matchedCardIds: Array.from({ length: 6 }, (_, index) => `card-${index}`),
    });
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
    repository.findSession.mockImplementation(async () =>
      MatchSession.reconstitute(session.toSnapshot()),
    );
    repository.completeSession.mockResolvedValue(true);
    repository.findBest.mockResolvedValue(null);
    repository.saveBest.mockImplementation(async (result) => ({ ...result, id: 'best-1', user }));
    useCase = new CompleteMatchSessionUseCase(
      {
        run: (work) =>
          work({ deckRepository: { findById: async () => deck }, matchRepository: repository }),
      },
      { now: () => new Date(now) },
    );
  });

  it.each([null, undefined, ''])('should_reject_completion_when_user_is_%s', async (userId) => {
    await expect(useCase.execute({ ...command, userId })).rejects.toThrow(
      MatchAuthenticationRequiredException,
    );
    expect(repository.completeSession).not.toHaveBeenCalled();
  });

  it('should_return_not_found_when_deck_is_missing', async () => {
    deck = null;
    await expect(useCase.execute(command)).rejects.toThrow(DeckNotFoundException);
    expect(repository.findSession).not.toHaveBeenCalled();
  });

  it.each(
    Object.values(DeckStatus).flatMap((status) =>
      Object.values(DeckVisibility).flatMap((visibility) =>
        ['owner', 'other-user'].map((ownerUserId) => ({ status, visibility, ownerUserId })),
      ),
    ),
  )(
    'should_recheck_access_when_$status/$visibility/$ownerUserId',
    async ({ status, visibility, ownerUserId }) => {
      deck = Deck.create({ id: 'deck-1', ownerUserId, title: 'Match', status, visibility });
      const allowed =
        ownerUserId === 'owner' ||
        (status === DeckStatus.PUBLISHED && visibility !== DeckVisibility.PRIVATE);
      const result = useCase.execute(command);

      if (allowed) {
        await expect(result).resolves.toMatchObject({ durationMs: 14500 });
      } else {
        await expect(result).rejects.toThrow(DeckAccessForbiddenException);
        expect(repository.findSession).not.toHaveBeenCalled();
        expect(repository.completeSession).not.toHaveBeenCalled();
      }
    },
  );

  it('should_return_not_found_when_session_id_is_forged', async () => {
    repository.findSession.mockResolvedValue(null);
    await expect(useCase.execute(command)).rejects.toThrow(MatchSessionNotFoundException);
    expect(repository.saveBest).not.toHaveBeenCalled();
  });

  it.each([{ deckId: 'other-deck' }, { userId: 'other-user' }])(
    'should_reject_completion_when_stored_session_belongs_elsewhere_%o',
    async (override) => {
      repository.findSession.mockResolvedValue(
        MatchSession.reconstitute({ ...session.toSnapshot(), ...override }),
      );
      await expect(useCase.execute(command)).rejects.toThrow(MatchSessionNotFoundException);
      expect(repository.completeSession).not.toHaveBeenCalled();
      expect(repository.saveBest).not.toHaveBeenCalled();
    },
  );

  it('should_reject_completion_when_session_expired', async () => {
    now = new Date('2026-09-09T10:30:00.000Z');
    await expect(useCase.execute(command)).rejects.toThrow(MatchSessionExpiredException);
    expect(repository.completeSession).not.toHaveBeenCalled();
  });

  it('should_return_the_persisted_completion_when_the_same_session_is_retried', async () => {
    session.complete(command.deckId, command.userId, completedAt);
    repository.findBest.mockResolvedValue({
      id: 'best-1',
      deckId: 'deck-1',
      userId: 'owner',
      durationMs: 14500,
      cardCount: 6,
      createdAt: completedAt,
      user,
    });

    await expect(useCase.execute(command)).resolves.toMatchObject({
      sessionId: 'session-1',
      durationMs: 14500,
      cardCount: 6,
      completedAt,
    });
    expect(repository.completeSession).not.toHaveBeenCalled();
    expect(repository.saveBest).not.toHaveBeenCalled();
  });

  it('should_reconcile_when_another_request_claimed_the_session', async () => {
    repository.completeSession.mockResolvedValue(false);
    const completed = MatchSession.reconstitute(session.toSnapshot());
    completed.complete(command.deckId, command.userId, completedAt);
    repository.findSession
      .mockResolvedValueOnce(MatchSession.reconstitute(session.toSnapshot()))
      .mockResolvedValueOnce(completed);
    repository.findBest.mockResolvedValue({
      id: 'best-1',
      deckId: 'deck-1',
      userId: 'owner',
      durationMs: 14500,
      cardCount: 6,
      createdAt: completedAt,
      user,
    });

    await expect(useCase.execute(command)).resolves.toMatchObject({ durationMs: 14500 });
    expect(repository.saveBest).not.toHaveBeenCalled();
  });

  it('should_save_server_derived_result_when_first_completion_is_valid', async () => {
    const result = await useCase.execute(command);

    expect(result).toEqual({
      sessionId: 'session-1',
      durationMs: 14500,
      cardCount: 6,
      completedAt,
      bestResult: {
        id: 'best-1',
        deckId: 'deck-1',
        userId: 'owner',
        durationMs: 14500,
        cardCount: 6,
        createdAt: completedAt,
        user,
      },
    });
    expect(repository.findSession).toHaveBeenCalledWith(command);
    expect(repository.completeSession.mock.calls[0][0].toSnapshot().completedAt).toEqual(
      completedAt,
    );
  });

  it.each([
    { durationMs: 16000, createdAt: startedAt, improves: true },
    { durationMs: 12000, createdAt: startedAt, improves: false },
    { durationMs: 14500, createdAt: startedAt, improves: false },
    { durationMs: 14500, createdAt: completedAt, improves: false },
    { durationMs: 14500, createdAt: new Date(completedAt.getTime() + 1), improves: true },
  ])(
    'should_retain_best_result_when_previous_result_is_$durationMs/$createdAt',
    async ({ durationMs, createdAt, improves }) => {
      const previous: MatchLeaderboardEntryReadModel = {
        id: 'best-1',
        deckId: 'deck-1',
        userId: 'owner',
        cardCount: 6,
        durationMs,
        createdAt,
        user,
      };
      repository.findBest.mockResolvedValue(previous);

      const result = await useCase.execute(command);

      expect(result.bestResult.durationMs).toBe(improves ? 14500 : durationMs);
      expect(result.bestResult.createdAt).toEqual(improves ? completedAt : createdAt);
      expect(repository.saveBest).toHaveBeenCalledTimes(improves ? 1 : 0);
      expect(repository.completeSession).toHaveBeenCalledTimes(1);
    },
  );

  it('should_surface_failure_when_persistence_cannot_save_result', async () => {
    repository.saveBest.mockRejectedValue(new Error('Database unavailable'));
    await expect(useCase.execute(command)).rejects.toThrow('Database unavailable');
  });
});
