import { BadRequestException } from '../../../common/exceptions/domain.exception';
import z from 'zod';
import { QUESTION_TYPE } from '../../domain/enums/question-type';
import { type SingleChoiceAnswer } from '../../domain/questions/single-choice.types';
import { LEARNING_ERRORS } from '../../domain/constant/learning-errors';

export const singleChoiceAnswerSchema = z
  .object({
    questionId: z.string().min(1),
    kind: z.literal(QUESTION_TYPE.SINGLE_CHOICE),
    selectedOptionId: z.string().min(1).nullable().optional(),
  })
  .strict();

export function parseSingleChoiceAnswer(input: unknown): SingleChoiceAnswer {
  const parsed = singleChoiceAnswerSchema.safeParse(input);

  if (!parsed.success) {
    throw new BadRequestException(LEARNING_ERRORS.INVALID_SINGLE_CHOICE_ANSWER);
  }

  return {
    questionId: parsed.data.questionId,
    kind: parsed.data.kind,
    selectedOptionId: parsed.data.selectedOptionId ?? null,
  };
}
