import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PublicDecksQueryDto } from '../../../presentation/dtos/deck-query.dto';

describe('PublicDecksQueryDto', () => {
  it('should_preserve_limit_when_per_page_is_omitted', async () => {
    const query = plainToInstance(PublicDecksQueryDto, { limit: '12', page: '2' });

    expect(await validate(query)).toEqual([]);
    expect(query.perPage ?? query.limit).toBe(12);
  });

  it.each([{ level: 'B7' }, { page: '0' }, { page: '1.5' }, { limit: '101' }])(
    'should_reject_invalid_catalog_parameters_when_given_%j',
    async (input) => {
      expect(await validate(plainToInstance(PublicDecksQueryDto, input))).not.toEqual([]);
    },
  );
});
