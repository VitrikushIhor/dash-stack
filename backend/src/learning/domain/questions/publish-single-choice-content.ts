import { BadRequestException } from '@common/exceptions/domain.exception';
import { LEARNING_ERRORS } from '../constant/learning-errors';
import type { PublishedSingleChoiceContent, SingleChoiceDraftContent } from './single-choice.types';
import { validateSingleChoicePublication } from './validate-single-choice-publication';

export function publishSingleChoiceContent(
  draft: SingleChoiceDraftContent,
): PublishedSingleChoiceContent {
  validateSingleChoicePublication(draft);

  const correctOptionId = draft.solution.correctOptionId;
  if (correctOptionId === null) {
    throw new BadRequestException(LEARNING_ERRORS.CORRECT_OPTION_ID_IS_REQUIRED);
  }

  return structuredClone({
    questionId: draft.questionId,
    kind: draft.kind,
    prompt: draft.prompt,
    options: draft.options.map((option) => ({ optionId: option.optionId, label: option.label })),
    solution: { correctOptionId },
    explanation: draft.explanation,
  });
}
