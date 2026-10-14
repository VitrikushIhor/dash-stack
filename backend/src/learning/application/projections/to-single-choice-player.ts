import {
  type PublishedSingleChoiceContent,
  type SingleChoiceContent,
} from '../../domain/questions/single-choice.types';

export function toSingleChoicePlayer(question: PublishedSingleChoiceContent): SingleChoiceContent {
  return {
    questionId: question.questionId,
    kind: question.kind,
    prompt: question.prompt,
    options: question.options.map((option) => ({
      optionId: option.optionId,
      label: option.label,
    })),
  };
}
