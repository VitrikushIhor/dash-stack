import { BadRequestException } from '@nestjs/common';
import {
  parseCreateMatchBody,
  validateMatchCompletionBody,
} from '../../../presentation/dtos/match-request.dto';

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
});
