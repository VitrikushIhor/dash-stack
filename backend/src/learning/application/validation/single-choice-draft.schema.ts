import { BadRequestException } from '@common/exceptions/domain.exception';
import { z } from 'zod';
import { LEARNING_ERRORS } from '../../domain/constant/learning-errors';
import { QUESTION_TYPE } from '../../domain/enums/question-type';
import type { SingleChoiceDraftContent } from '../../domain/questions/single-choice.types';
import { parseLearningDocument } from './learning-document.schema';

const identifierSchema = z.string().refine((value) => value.trim().length > 0);

const singleChoiceDraftSchema = z
  .object({
    questionId: identifierSchema,
    kind: z.literal(QUESTION_TYPE.SINGLE_CHOICE),
    prompt: z.unknown(),
    options: z.array(z.object({ optionId: identifierSchema, label: z.unknown() }).strict()).max(10),
    solution: z.object({ correctOptionId: identifierSchema.nullable() }).strict(),
    explanation: z.unknown(),
  })
  .strict();

export function parseSingleChoiceDraft(input: unknown): SingleChoiceDraftContent {
  const parsed = singleChoiceDraftSchema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException(LEARNING_ERRORS.INVALID_SINGLE_CHOICE_DRAFT);
  }

  const draft = parsed.data;
  const optionIds = new Set<string>();
  for (const option of draft.options) {
    if (optionIds.has(option.optionId)) {
      throw new BadRequestException(LEARNING_ERRORS.OPTION_IDS_MUST_BE_UNIQUE);
    }
    optionIds.add(option.optionId);
  }

  if (draft.solution.correctOptionId !== null && !optionIds.has(draft.solution.correctOptionId)) {
    throw new BadRequestException(LEARNING_ERRORS.CORRECT_OPTION_ID_MUST_BE_ONE_OF_THE_OPTIONS);
  }

  return {
    questionId: draft.questionId,
    kind: draft.kind,
    prompt: parseLearningDocument(draft.prompt),
    options: draft.options.map((option) => ({
      optionId: option.optionId,
      label: parseLearningDocument(option.label),
    })),
    solution: { correctOptionId: draft.solution.correctOptionId },
    explanation: parseLearningDocument(draft.explanation),
  };
}
