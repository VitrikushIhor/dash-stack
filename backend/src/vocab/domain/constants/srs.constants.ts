export const LEITNER_BOX_INTERVALS_DAYS = {
  1: 1, // Box 1: 1 day
  2: 3, // Box 2: 3 days
  3: 7, // Box 3: 7 days
  4: 14, // Box 4: 14 days
  5: 30, // Box 5: 30 days (Mastery)
} as const;

export const MIN_LEITNER_BOX = 1;
export const MAX_LEITNER_BOX = 5;

export type LeitnerBoxNumber = 1 | 2 | 3 | 4 | 5;
