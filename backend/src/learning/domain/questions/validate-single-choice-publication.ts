import { BadRequestException } from '@common/exceptions/domain.exception';
import { extractDocumentText } from '../documents/extract-document-text';
import { type SingleChoiceDraftContent } from './single-choice.types';
import { LEARNING_ERRORS } from '../constant/learning-errors';
import { normalizeChoiceLabel } from './normalize-choice-label';
import { countDocumentGraphemes } from '../documents/count-document-graphemes';
import { SINGLE_CHOICE_LIMITS } from './single-choice-limits';

export function validateSingleChoicePublication(question: SingleChoiceDraftContent): void {
  if (!extractDocumentText(question.prompt).trim()) {
    throw new BadRequestException(LEARNING_ERRORS.PROMPT_CANNOT_BE_EMPTY);
  }

  if (countDocumentGraphemes(question.prompt) > SINGLE_CHOICE_LIMITS.MAX_PROMPT_GRAPHEMES) {
    throw new BadRequestException(LEARNING_ERRORS.PROMPT_TEXT_LIMIT_EXCEEDED);
  }

  if (
    countDocumentGraphemes(question.explanation) > SINGLE_CHOICE_LIMITS.MAX_EXPLANATION_GRAPHEMES
  ) {
    throw new BadRequestException(LEARNING_ERRORS.EXPLANATION_TEXT_LIMIT_EXCEEDED);
  }

  if (question.options.length < 2 || question.options.length > 10) {
    throw new BadRequestException(LEARNING_ERRORS.OPTIONS_MUST_BE_BETWEEN_2_AND_10);
  }

  const optionIds = new Set<string>();
  const optionLabels = new Set<string>();

  for (const option of question.options) {
    const normalizedLabel = normalizeChoiceLabel(option.label);

    if (!normalizedLabel) {
      throw new BadRequestException(LEARNING_ERRORS.OPTION_LABEL_CANNOT_BE_EMPTY);
    }

    if (countDocumentGraphemes(option.label) > SINGLE_CHOICE_LIMITS.MAX_LABEL_GRAPHEMES) {
      throw new BadRequestException(LEARNING_ERRORS.OPTION_LABEL_TEXT_LIMIT_EXCEEDED);
    }

    if (optionLabels.has(normalizedLabel)) {
      throw new BadRequestException(LEARNING_ERRORS.OPTION_LABELS_MUST_BE_UNIQUE);
    }

    optionLabels.add(normalizedLabel);

    if (!option.optionId.trim()) {
      throw new BadRequestException(LEARNING_ERRORS.OPTION_ID_CANNOT_BE_EMPTY);
    }

    if (optionIds.has(option.optionId)) {
      throw new BadRequestException(LEARNING_ERRORS.OPTION_IDS_MUST_BE_UNIQUE);
    }

    optionIds.add(option.optionId);
  }

  const correctOptionId = question.solution.correctOptionId;

  if (correctOptionId === null || !correctOptionId.trim()) {
    throw new BadRequestException(LEARNING_ERRORS.CORRECT_OPTION_ID_IS_REQUIRED);
  }

  if (!optionIds.has(correctOptionId)) {
    throw new BadRequestException(LEARNING_ERRORS.CORRECT_OPTION_ID_MUST_BE_ONE_OF_THE_OPTIONS);
  }
}
