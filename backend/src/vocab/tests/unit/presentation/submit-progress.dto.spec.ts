import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SubmitProgressDto } from '../../../presentation/dtos/submit-progress.dto';

describe('SubmitProgressDto', () => {
  it.each([null, '', ' ', 'x'.repeat(101), 12, { key: 'attempt' }])(
    'should_reject_invalid_attempt_id_when_value_is_%j',
    async (attemptId: unknown) => {
      const dto = plainToInstance(SubmitProgressDto, {
        attemptId,
        results: [{ flashcardId: 'card-1', isCorrect: true }],
      });
      expect((await validate(dto)).some((error) => error.property === 'attemptId')).toBe(true);
    },
  );

  it.each([undefined, 'learn-session:42'])(
    'should_accept_legacy_or_identified_attempt_when_id_is_%s',
    async (attemptId) => {
      const dto = plainToInstance(SubmitProgressDto, {
        attemptId,
        results: [{ flashcardId: 'card-1', isCorrect: true }],
      });
      expect(await validate(dto)).toEqual([]);
    },
  );
});
