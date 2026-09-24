import { RecordMatchPairUseCase } from '../../../application/use-cases/record-match-pair.use-case';
import { MatchRepositoryPort } from '../../../application/ports/match-repository.port';
import { Deck } from '../../../domain/entities/deck.entity';
import { MatchSession } from '../../../domain/entities/match-session.entity';
import {
  MatchAuthenticationRequiredException,
  MatchPairInvalidException,
  MatchSessionExpiredException,
} from '../../../domain/exceptions/match-domain.exceptions';

describe('RecordMatchPairUseCase', () => {
  const now = new Date('2026-09-09T10:01:00.000Z');
  const cards = Array.from({ length: 6 }, (_, index) => `card-${index}`);
  let repository: jest.Mocked<MatchRepositoryPort>;
  let useCase: RecordMatchPairUseCase;
  const command = {
    deckId: 'deck-1',
    sessionId: 'session-1',
    userId: 'owner',
    attemptId: '00000000-0000-4000-8000-000000000001',
    first: { cardId: cards[0], side: 'TERM' as const },
    second: { cardId: cards[0], side: 'DEFINITION' as const },
  };

  beforeEach(() => {
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
    repository.findSession.mockResolvedValue(
      MatchSession.reconstitute({
        ...MatchSession.create(
          { deckId: 'deck-1', userId: 'owner', selectedCardIds: cards },
          new Date('2026-09-09T10:00:00.000Z'),
        ).toSnapshot(),
        id: 'session-1',
      }),
    );
    repository.recordMatchedPair.mockResolvedValue(true);
    useCase = new RecordMatchPairUseCase(
      {
        run: (work) =>
          work({
            deckRepository: {
              findById: async () =>
                Deck.create({ id: 'deck-1', ownerUserId: 'owner', title: 'Deck' }),
            },
            matchRepository: repository,
          }),
      },
      { now: () => now },
    );
  });

  it('should_require_authentication', async () => {
    await expect(useCase.execute({ ...command, userId: undefined })).rejects.toThrow(
      MatchAuthenticationRequiredException,
    );
  });

  it('should_record_a_selected_pair_and_accept_idempotent_repository_success', async () => {
    await expect(useCase.execute(command)).resolves.toBeUndefined();
    await expect(useCase.execute(command)).resolves.toBeUndefined();
    expect(repository.recordMatchedPair).toHaveBeenCalledTimes(2);
  });

  it('should_reject_a_card_outside_the_session', async () => {
    await expect(
      useCase.execute({
        ...command,
        first: { cardId: 'forged', side: 'TERM' },
      }),
    ).rejects.toThrow(MatchPairInvalidException);
  });

  it('should_reject_an_expired_session', async () => {
    useCase = new RecordMatchPairUseCase(
      {
        run: (work) =>
          work({
            deckRepository: {
              findById: async () =>
                Deck.create({ id: 'deck-1', ownerUserId: 'owner', title: 'Deck' }),
            },
            matchRepository: repository,
          }),
      },
      { now: () => new Date('2026-09-09T10:30:00.000Z') },
    );
    await expect(
      useCase.execute({
        deckId: 'deck-1',
        sessionId: 'session-1',
        userId: 'owner',
        attemptId: command.attemptId,
        first: command.first,
        second: command.second,
      }),
    ).rejects.toThrow(MatchSessionExpiredException);
  });
});
