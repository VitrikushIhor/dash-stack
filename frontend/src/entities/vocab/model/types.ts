export const VocabProgressStatus = {
  NEW: 'NEW',
  LEARNING: 'LEARNING',
  KNOWN: 'KNOWN',
  MASTERED: 'MASTERED',
  FORGOTTEN: 'FORGOTTEN',
} as const
export type VocabProgressStatus =
  (typeof VocabProgressStatus)[keyof typeof VocabProgressStatus]

export const StudyMode = {
  FLASHCARDS: 'flashcards',
  LEARN: 'learn',
  TEST: 'test',
  MATCH: 'match',
} as const
export type StudyMode = (typeof StudyMode)[keyof typeof StudyMode]

export type StudyCardProgress = {
  id: string | null
  status: VocabProgressStatus
  box: number
  isStarred: boolean
  correctStreak: number
  correctCount: number
  incorrectCount: number
  lastReviewedAt: string | null
  nextReviewAt: string | null
}

export type StudyCard = {
  id: string
  deckId: string
  term: string
  definition: string
  example: string | null
  imageUrl: string | null
  position: number
  progress: StudyCardProgress
}

export type SubmitProgressItem = {
  flashcardId: string
  isCorrect: boolean
}

export type SubmitProgressPayload = {
  deckId: string
  results: SubmitProgressItem[]
}

export type DeckDueReviews = {
  deckId: string
  deckTitle: string
  dueCount: number
}

export type DueReviewsResponse = {
  totalDue: number
  perDeck: DeckDueReviews[]
}

export type ToggleStarPayload = {
  cardId: string
  isStarred: boolean
}

export type ToggleStarResponse = {
  flashcardId: string
  isStarred: boolean
}

export type StudySessionQuery = {
  deckId: string
  mode?: StudyMode
  onlyStarred?: boolean
  onlyDue?: boolean
}

export type VocabProgressResponse = {
  id: string
  userId: string
  deckId: string
  flashcardId: string
  status: VocabProgressStatus
  box: number
  isStarred: boolean
  correctStreak: number
  correctCount: number
  incorrectCount: number
  lastReviewedAt: string | null
  nextReviewAt: string | null
  createdAt: string
  updatedAt: string
}

export type MatchLeaderboardEntry = {
  id: string
  userId: string
  deckId: string
  durationMs: number
  cardCount: number
  createdAt: string
}

export type SubmitMatchScorePayload = {
  deckId: string
  durationMs: number
}
