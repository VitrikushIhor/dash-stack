import { QUESTION_TYPE } from '../../../domain/enums/question-type';
import { SingleChoiceEvaluator } from '../../../domain/questions/single-choice-evaluator';
import { LEARNING_ERRORS } from '../../../domain/constant/learning-errors';
import {
  BadRequestException,
  InternalErrorException,
} from '../../../../common/exceptions/domain.exception';

describe('SingleChoiceEvaluator', () => {
  const evaluator = new SingleChoiceEvaluator();
  const question = {
    questionId: 'question-1',
    kind: QUESTION_TYPE.SINGLE_CHOICE,
    optionIds: ['option-a', 'option-b', 'option-c'],
    correctOptionId: 'option-b',
  };

  it('should_award_one_point_when_the_selected_option_is_correct', () => {
    expect(
      evaluator.evaluate(question, {
        questionId: 'question-1',
        kind: QUESTION_TYPE.SINGLE_CHOICE,
        selectedOptionId: 'option-b',
      }),
    ).toEqual({
      questionId: 'question-1',
      kind: QUESTION_TYPE.SINGLE_CHOICE,
      selectedOptionId: 'option-b',
      correctOptionId: 'option-b',
      isCorrect: true,
      earnedPoints: 1,
      maxPoints: 1,
    });
  });

  it('should_award_zero_points_when_the_selected_option_is_wrong', () => {
    expect(
      evaluator.evaluate(question, {
        questionId: 'question-1',
        kind: QUESTION_TYPE.SINGLE_CHOICE,
        selectedOptionId: 'option-a',
      }),
    ).toMatchObject({
      selectedOptionId: 'option-a',
      correctOptionId: 'option-b',
      isCorrect: false,
      earnedPoints: 0,
      maxPoints: 1,
    });
  });

  it('should_treat_a_missing_answer_as_zero_points', () => {
    expect(evaluator.evaluate(question, undefined)).toMatchObject({
      selectedOptionId: null,
      correctOptionId: 'option-b',
      isCorrect: false,
      earnedPoints: 0,
      maxPoints: 1,
    });
  });

  it('should_treat_a_null_selection_as_zero_points', () => {
    expect(
      evaluator.evaluate(question, {
        questionId: 'question-1',
        kind: QUESTION_TYPE.SINGLE_CHOICE,
        selectedOptionId: null,
      }),
    ).toMatchObject({
      selectedOptionId: null,
      isCorrect: false,
      earnedPoints: 0,
    });
  });

  it('should_reject_an_answer_for_another_question', () => {
    expect(() =>
      evaluator.evaluate(question, {
        questionId: 'question-2',
        kind: QUESTION_TYPE.SINGLE_CHOICE,
        selectedOptionId: 'option-b',
      }),
    ).toThrow(new BadRequestException(LEARNING_ERRORS.INVALID_ANSWER));
  });

  it('should_reject_an_option_outside_the_published_question', () => {
    expect(() =>
      evaluator.evaluate(question, {
        questionId: 'question-1',
        kind: QUESTION_TYPE.SINGLE_CHOICE,
        selectedOptionId: 'forged-option',
      }),
    ).toThrow(new BadRequestException(LEARNING_ERRORS.INVALID_ANSWER));
  });

  it('should_reject_an_invalid_published_question_solution', () => {
    expect(() =>
      evaluator.evaluate(
        { ...question, correctOptionId: 'missing-option' },
        { questionId: 'question-1', kind: QUESTION_TYPE.SINGLE_CHOICE, selectedOptionId: null },
      ),
    ).toThrow(new InternalErrorException(LEARNING_ERRORS.INCONSISTENT_QUESTION));
  });
});
