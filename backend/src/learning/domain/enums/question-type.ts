export const QUESTION_TYPE = {
  SINGLE_CHOICE: 'SINGLE_CHOICE',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TEXT: 'TEXT',
  GAPS: 'GAPS',
  MATCHING: 'MATCHING',
} as const;

export type QuestionType = (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE];
