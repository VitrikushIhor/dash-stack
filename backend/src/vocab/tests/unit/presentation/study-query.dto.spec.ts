import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { StudySessionQueryDto } from '../../../presentation/dtos/study-session-query.dto';
import { SubmitProgressDto } from '../../../presentation/dtos/submit-progress.dto';

describe('Study HTTP input validation', () => {
  it.each([
    ['true', true],
    ['false', false],
    ['1', true],
    ['0', false],
  ] as const)('should_parse_boolean_query_when_value_is_%s', async (value, expected) => {
    const dto = plainToInstance(
      StudySessionQueryDto,
      { onlyDue: value, onlyStarred: value },
      { enableImplicitConversion: true },
    );
    expect(await validate(dto)).toEqual([]);
    expect(dto.onlyDue).toBe(expected);
    expect(dto.onlyStarred).toBe(expected);
  });
  it.each(['nope', '', ['true', 'false']])(
    'should_reject_invalid_boolean_query_when_value_is_%s',
    async (value) => {
      const dto = plainToInstance(
        StudySessionQueryDto,
        { onlyDue: value },
        { enableImplicitConversion: true },
      );
      expect(await validate(dto)).not.toHaveLength(0);
    },
  );
  it('should_reject_string_correctness_when_submitting_progress', async () => {
    const dto = plainToInstance(
      SubmitProgressDto,
      { results: [{ flashcardId: 'card', isCorrect: 'false' }] },
      { enableImplicitConversion: true },
    );
    expect(await validate(dto)).not.toHaveLength(0);
  });
});
