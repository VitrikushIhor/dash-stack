import { BadRequestException } from '@nestjs/common';
import {
  parseCreateMatchBody,
  validateMatchCompletionBody,
} from '../../../presentation/dtos/match-request.dto';
import { normalizeRecordMatchPairDto } from '../../../presentation/mappers/match-request.mapper';

describe('Match request body parsers', () => {
  it('accepts an omitted create-session body', () => {
    expect(parseCreateMatchBody(undefined)).toEqual({});
  });

  it('rejects non-object request bodies with a specific error', () => {
    expect(() => parseCreateMatchBody(['invalid'])).toThrow(
      new BadRequestException('Match body must be a JSON object.'),
    );
  });

  it('rejects completion body fields', () => {
    expect(() => validateMatchCompletionBody({ durationMs: 1 })).toThrow(
      new BadRequestException('Match completion accepts no body fields'),
    );
  });

  it('normalizes a legacy correct-pair request outside the controller', () => {
    const result = normalizeRecordMatchPairDto('session-1', { cardId: 'card-1' });

    expect(result).toEqual({
      attemptId: expect.stringMatching(/^[0-9a-f-]{36}$/),
      first: { cardId: 'card-1', side: 'TERM' },
      second: { cardId: 'card-1', side: 'DEFINITION' },
    });
  });

  it('rejects an incomplete attempt request at the transport boundary', () => {
    expect(() =>
      normalizeRecordMatchPairDto('session-1', {
        attemptId: '00000000-0000-4000-8000-000000000001',
      }),
    ).toThrow(new BadRequestException('Invalid match attempt'));
  });
});
