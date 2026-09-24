import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SaveDeckEditorDto } from '../../../presentation/dtos/save-deck-editor.dto';

describe('SaveDeckEditorDto', () => {
  const basePayload = {
    operationId: '7d44c28b-e870-42c6-bd8f-70a702513d9c',
    expectedUpdatedAt: '2026-09-21T12:00:00.000Z',
    cards: [],
  };

  it.each([undefined, null, 'metadata'])(
    'should_reject_missing_or_invalid_metadata_when_value_is_%j',
    async (metadata: unknown) => {
      const dto = plainToInstance(SaveDeckEditorDto, { ...basePayload, metadata });

      expect((await validate(dto)).some((error) => error.property === 'metadata')).toBe(true);
    },
  );

  it('should_accept_a_complete_snapshot_with_more_than_500_cards', async () => {
    const dto = plainToInstance(SaveDeckEditorDto, {
      ...basePayload,
      metadata: {},
      cards: Array.from({ length: 501 }, (_, position) => ({
        term: `Term ${position}`,
        definition: `Definition ${position}`,
      })),
    });

    expect(await validate(dto)).toEqual([]);
  });
});
