import { BadRequestException } from '../../../../common/exceptions/domain.exception';
import { parseSingleChoiceAnswer } from '../../../application/validation/single-choice-answer.schema';
import { LEARNING_ERRORS } from '../../../domain/constant/learning-errors';
import { QUESTION_TYPE } from '../../../domain/enums/question-type';

describe('parseSingleChoiceAnswer', () => {
  const answer = {
    questionId: 'question-1',
    kind: QUESTION_TYPE.SINGLE_CHOICE,
    selectedOptionId: 'option-a',
  };

  it('should_return_the_answer_when_the_payload_is_valid', () => {
    const result = parseSingleChoiceAnswer(answer);

    expect(result).toEqual(answer);
  });

  it('should_normalize_the_selection_to_null_when_the_field_is_missing', () => {
    const result = parseSingleChoiceAnswer({
      questionId: answer.questionId,
      kind: answer.kind,
    });

    expect(result).toEqual({ ...answer, selectedOptionId: null });
  });

  it('should_preserve_null_when_no_option_is_selected', () => {
    const result = parseSingleChoiceAnswer({ ...answer, selectedOptionId: null });

    expect(result).toEqual({ ...answer, selectedOptionId: null });
  });

  const invalidPayloads: ReadonlyArray<{ reason: string; payload: unknown }> = [
    { reason: 'kind_is_different', payload: { ...answer, kind: QUESTION_TYPE.MATCHING } },
    { reason: 'question_id_is_empty', payload: { ...answer, questionId: '' } },
    { reason: 'option_id_is_empty', payload: { ...answer, selectedOptionId: '' } },
    { reason: 'question_id_is_not_a_string', payload: { ...answer, questionId: 42 } },
    { reason: 'option_id_is_not_a_string', payload: { ...answer, selectedOptionId: 42 } },
    { reason: 'client_supplies_a_score', payload: { ...answer, earnedPoints: 100 } },
    { reason: 'payload_is_null', payload: null },
    { reason: 'payload_is_undefined', payload: undefined },
    { reason: 'payload_is_an_array', payload: [answer] },
  ];

  it.each(invalidPayloads)('should_reject_the_answer_when_$reason', ({ payload }) => {
    const parse = () => parseSingleChoiceAnswer(payload);

    expect(parse).toThrow(BadRequestException);
    expect(parse).toThrow(LEARNING_ERRORS.INVALID_SINGLE_CHOICE_ANSWER);
  });
});
