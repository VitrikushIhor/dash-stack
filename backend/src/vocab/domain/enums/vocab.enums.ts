export const DeckVisibility = {
  PRIVATE: 'PRIVATE',
  UNLISTED: 'UNLISTED',
  PUBLIC: 'PUBLIC',
} as const;

export type DeckVisibility = (typeof DeckVisibility)[keyof typeof DeckVisibility];

export const DeckStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type DeckStatus = (typeof DeckStatus)[keyof typeof DeckStatus];

export const DeckType = {
  USER_GENERATED: 'USER_GENERATED',
  SYSTEM: 'SYSTEM',
} as const;

export type DeckType = (typeof DeckType)[keyof typeof DeckType];

export const CEFRLevel = {
  A1: 'A1',
  A2: 'A2',
  B1: 'B1',
  B2: 'B2',
  C1: 'C1',
  C2: 'C2',
} as const;

export type CEFRLevel = (typeof CEFRLevel)[keyof typeof CEFRLevel];

export const VocabProgressStatus = {
  NEW: 'NEW',
  LEARNING: 'LEARNING',
  KNOWN: 'KNOWN',
  MASTERED: 'MASTERED',
  FORGOTTEN: 'FORGOTTEN',
} as const;

export type VocabProgressStatus = (typeof VocabProgressStatus)[keyof typeof VocabProgressStatus];
