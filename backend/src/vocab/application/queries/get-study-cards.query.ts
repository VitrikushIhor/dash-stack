export const StudyMode = {
  FLASHCARDS: 'flashcards',
  LEARN: 'learn',
  TEST: 'test',
  MATCH: 'match',
} as const;

export type StudyMode = (typeof StudyMode)[keyof typeof StudyMode];

export interface GetStudyCardsQuery {
  userId: string | null;
  deckId: string;
  mode?: StudyMode;
  onlyStarred?: boolean;
  onlyDue?: boolean;
}
