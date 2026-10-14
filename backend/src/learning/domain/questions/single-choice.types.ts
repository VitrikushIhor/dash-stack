import { type LearningDocument } from '../documents/learning-document.types';
import { QUESTION_TYPE } from '../enums/question-type';

export type PublishedSingleChoiceQuestion = {
  readonly questionId: string;
  readonly kind: typeof QUESTION_TYPE.SINGLE_CHOICE;
  readonly optionIds: readonly string[];
  readonly correctOptionId: string;
};

export type SingleChoiceResult = {
  readonly questionId: string;
  readonly kind: typeof QUESTION_TYPE.SINGLE_CHOICE;
  readonly selectedOptionId: string | null;
  readonly correctOptionId: string;
  readonly isCorrect: boolean;
  readonly earnedPoints: 0 | 1;
  readonly maxPoints: 1;
};

export type SingleChoiceAnswer = {
  readonly questionId: string;
  readonly kind: typeof QUESTION_TYPE.SINGLE_CHOICE;
  readonly selectedOptionId: string | null;
};

export type SingleChoiceOption = {
  readonly optionId: string;
  readonly label: LearningDocument;
};

export type SingleChoiceContent = {
  readonly questionId: string;
  readonly kind: typeof QUESTION_TYPE.SINGLE_CHOICE;
  readonly prompt: LearningDocument;
  readonly options: readonly SingleChoiceOption[];
};

export interface PublishedSingleChoiceContent extends SingleChoiceContent {
  readonly solution: { readonly correctOptionId: string };
  readonly explanation: LearningDocument;
}

export interface SingleChoiceDraftContent extends SingleChoiceContent {
  readonly solution: { readonly correctOptionId: string | null };
  readonly explanation: LearningDocument;
}
