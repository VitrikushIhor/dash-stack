import {
  type PublishedSingleChoiceQuestion,
  type PublishedSingleChoiceContent,
} from '../../domain/questions/single-choice.types';

export function toSingleChoiceScoring(
  question: PublishedSingleChoiceContent,
): PublishedSingleChoiceQuestion {
  return {
    questionId: question.questionId,
    kind: question.kind,
    optionIds: question.options.map((option) => option.optionId),
    correctOptionId: question.solution.correctOptionId,
  };
}
