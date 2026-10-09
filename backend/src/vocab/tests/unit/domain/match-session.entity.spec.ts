import { MatchSession } from '../../../domain/entities/match-session.entity';
import {
  InvalidMatchSessionException,
  MatchSessionAlreadyCompletedException,
  MatchSessionExpiredException,
  MatchSessionIncompleteException,
  MatchSessionNotFoundException,
} from '../../../domain/exceptions/match-domain.exceptions';

const startedAt = new Date('2026-09-09T10:00:00.000Z');
const cardIds = Array.from({ length: 6 }, (_, index) => `card-${index}`);
const createSession = () =>
  MatchSession.reconstitute({
    ...MatchSession.create(
      { deckId: 'deck-1', userId: 'user-1', selectedCardIds: cardIds },
      startedAt,
    ).toSnapshot(),
    matchedCardIds: cardIds,
  });

describe('MatchSession', () => {
  it('should_reject_completion_until_every_server_pair_is_recorded', () => {
    const session = MatchSession.create(
      { deckId: 'deck-1', userId: 'user-1', selectedCardIds: cardIds },
      startedAt,
    );
    expect(() =>
      session.complete('deck-1', 'user-1', new Date(startedAt.getTime() + 1000)),
    ).toThrow(MatchSessionIncompleteException);
  });
  it.each([6, 7, 8, 9, 10, 11, 12])(
    'should_preserve_server_selection_when_it_contains_%i_unique_cards',
    (count) => {
      const selectedCardIds = Array.from({ length: count }, (_, index) => `card-${index}`);

      const session = MatchSession.create(
        { deckId: 'deck-1', userId: 'user-1', selectedCardIds },
        startedAt,
      );

      expect(session.toSnapshot().selectedCardIds).toEqual(selectedCardIds);
      expect(session.toSnapshot().expiresAt).toEqual(new Date('2026-09-09T10:30:00.000Z'));
      expect(session.toSnapshot().completedAt).toBeNull();
    },
  );

  it.each([0, 5, 13])('should_reject_selection_when_it_contains_%i_cards', (count) => {
    expect(() =>
      MatchSession.create(
        {
          deckId: 'deck-1',
          userId: 'user-1',
          selectedCardIds: Array.from({ length: count }, (_, index) => `card-${index}`),
        },
        startedAt,
      ),
    ).toThrow(InvalidMatchSessionException);
  });

  it('should_reject_selection_when_card_ids_are_duplicated', () => {
    expect(() =>
      MatchSession.create(
        { deckId: 'deck-1', userId: 'user-1', selectedCardIds: Array<string>(6).fill('card-1') },
        startedAt,
      ),
    ).toThrow(InvalidMatchSessionException);
  });

  it('should_derive_duration_and_count_when_completing_a_stored_session', () => {
    const session = MatchSession.reconstitute({ ...createSession().toSnapshot(), id: 'session-1' });
    const completedAt = new Date('2026-09-09T10:00:14.500Z');

    const result = session.complete('deck-1', 'user-1', completedAt);

    expect(result).toEqual({
      deckId: 'deck-1',
      userId: 'user-1',
      durationMs: 14500,
      cardCount: 6,
      createdAt: completedAt,
    });
    expect(session.toSnapshot().completedAt).toEqual(completedAt);
  });

  it.each([1800000, 1800001])('should_reject_completion_when_elapsed_time_is_%i_ms', (elapsed) => {
    const session = createSession();

    expect(() =>
      session.complete('deck-1', 'user-1', new Date(startedAt.getTime() + elapsed)),
    ).toThrow(MatchSessionExpiredException);
    expect(session.toSnapshot().completedAt).toBeNull();
  });

  it('should_accept_completion_when_one_millisecond_before_expiry', () => {
    const result = createSession().complete(
      'deck-1',
      'user-1',
      new Date('2026-09-09T10:29:59.999Z'),
    );
    expect(result.durationMs).toBe(1799999);
  });

  it('should_reject_completion_when_session_was_already_completed', () => {
    const session = createSession();
    session.complete('deck-1', 'user-1', new Date('2026-09-09T10:00:01.000Z'));
    const stored = MatchSession.reconstitute(session.toSnapshot());

    expect(() => stored.complete('deck-1', 'user-1', new Date('2026-09-09T10:00:02.000Z'))).toThrow(
      MatchSessionAlreadyCompletedException,
    );
  });

  it.each([
    ['other-deck', 'user-1'],
    ['deck-1', 'other-user'],
  ])('should_hide_session_when_requested_by_%s_%s', (deckId, userId) => {
    expect(() => createSession().complete(deckId, userId, startedAt)).toThrow(
      MatchSessionNotFoundException,
    );
  });

  it('should_reject_completion_when_clock_precedes_start', () => {
    expect(() =>
      createSession().complete('deck-1', 'user-1', new Date(startedAt.getTime() - 1)),
    ).toThrow(InvalidMatchSessionException);
  });

  it('should_preserve_session_when_callers_mutate_input_or_snapshot', () => {
    const input = { deckId: 'deck-1', userId: 'user-1', selectedCardIds: [...cardIds] };
    const now = new Date(startedAt);
    const session = MatchSession.create(input, now);
    input.selectedCardIds[0] = 'forged';
    now.setTime(0);
    const snapshot = session.toSnapshot();
    snapshot.selectedCardIds[0] = 'forged';
    snapshot.startedAt.setTime(0);
    snapshot.expiresAt.setTime(0);

    expect(session.toSnapshot().selectedCardIds).toEqual(cardIds);
    expect(session.toSnapshot().startedAt).toEqual(startedAt);
    const completedSession = MatchSession.reconstitute({
      ...session.toSnapshot(),
      matchedCardIds: cardIds,
    });
    expect(
      completedSession.complete('deck-1', 'user-1', new Date(startedAt.getTime() + 1000))
        .durationMs,
    ).toBe(1000);
  });
});
