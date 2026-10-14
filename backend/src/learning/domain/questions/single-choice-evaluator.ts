import {
  BadRequestException,
  InternalErrorException,
} from './../../../common/exceptions/domain.exception';
import { QUESTION_TYPE } from '../enums/question-type';
import {
  type PublishedSingleChoiceQuestion,
  type SingleChoiceAnswer,
  type SingleChoiceResult,
} from './single-choice.types';
import { LEARNING_ERRORS } from '../constant/learning-errors';

export class SingleChoiceEvaluator {
  evaluate(
    question: PublishedSingleChoiceQuestion,
    answer: SingleChoiceAnswer | undefined,
  ): SingleChoiceResult {
    assertPublishedQuestionIsConsistent(question);

    let selectedOptionId: string | null = null;
    if (answer !== undefined) {
      if (answer.questionId !== question.questionId) {
        throw new BadRequestException(LEARNING_ERRORS.INVALID_ANSWER);
      }

      selectedOptionId = answer.selectedOptionId;
      if (selectedOptionId !== null && !question.optionIds.includes(selectedOptionId)) {
        throw new BadRequestException(LEARNING_ERRORS.INVALID_ANSWER);
      }
    }

    const isCorrect = selectedOptionId === question.correctOptionId;

    return {
      questionId: question.questionId,
      kind: QUESTION_TYPE.SINGLE_CHOICE,
      selectedOptionId,
      correctOptionId: question.correctOptionId,
      isCorrect,
      earnedPoints: isCorrect ? 1 : 0,
      maxPoints: 1,
    };
  }
}

function assertPublishedQuestionIsConsistent(question: PublishedSingleChoiceQuestion): void {
  const optionIds = question.optionIds;
  const uniqueOptionIds = new Set(optionIds);

  if (
    question.kind !== QUESTION_TYPE.SINGLE_CHOICE ||
    question.questionId.length === 0 ||
    optionIds.length < 2 ||
    optionIds.length > 10 ||
    uniqueOptionIds.size !== optionIds.length ||
    optionIds.some((optionId) => optionId.length === 0) ||
    !uniqueOptionIds.has(question.correctOptionId)
  ) {
    throw new InternalErrorException(LEARNING_ERRORS.INCONSISTENT_QUESTION);
  }
}
