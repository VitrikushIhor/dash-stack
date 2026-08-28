export const ANSWER_FEEDBACK_DELAY_MS = 800
export const TYPING_FEEDBACK_DELAY_MS = 1500

export const QUESTION_TYPES = {
  MCQ: 'mcq',
  TYPING: 'typing',
} as const

export type LearnQuestionType =
  (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES]

export const MATCH_DELAY_MS = 600
export const WRONG_MATCH_DELAY_MS = 800
export const MATCH_WIN_DELAY_MS = 1500
export const PENALTY_TIME_MS = 2000
export const MIN_MATCH_CARDS = 6
export const MAX_MATCH_CARDS = 12
