import { InternalErrorException } from '../../../../common/exceptions/domain.exception';
import { mapMatchCardQueryRows } from '../../../infrastructure/persistence/match-card-query.mapper';

describe('mapMatchCardQueryRows', () => {
  it('maps valid raw query rows to Match card read models', () => {
    const rows: unknown = [
      {
        id: 'card-1',
        deckId: 'deck-1',
        term: 'hello',
        definition: 'привіт',
      },
    ];

    expect(mapMatchCardQueryRows(rows)).toEqual(rows);
  });

  it('rejects an invalid raw query row with an internal error', () => {
    const rows: unknown = [{ id: 'card-1', deckId: 'deck-1', term: 'hello' }];

    expect(() => mapMatchCardQueryRows(rows)).toThrow(InternalErrorException);
  });
});
