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

export type DeckCardSelectionSummary = {
  total: number
  due: number
  starred: number
  dueAndStarred: number
}

export type DeckCardsPage = {
  data: StudyCard[]
  meta: {
    total: number
    lastPage: number
    currentPage: number
    perPage: number
    prev: number | null
    next: number | null
  }
  summary: DeckCardSelectionSummary
}

export type SubmitProgressItem = {
  flashcardId: string
  isCorrect: boolean
}

export type SubmitProgressPayload = {
  deckId: string
  attemptId?: string
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

export type ImportFlashcard = {
  term: string
  definition: string
  example?: string | null
  imageUrl?: string | null
}

export type ImportFlashcardsResponse = {
  importId: string
  cardIds: string[]
  importedCount: number
  idempotent: boolean
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
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    avatar: string | null
  }
}

export type MatchCard = Pick<StudyCard, 'id' | 'deckId' | 'term' | 'definition'>

export type MatchSession = {
  id: string
  deckId: string
  startedAt: string
  expiresAt: string
  cards: MatchCard[]
}

export const MatchTileSide = {
  TERM: 'TERM',
  DEFINITION: 'DEFINITION',
} as const
export type MatchTileSide = (typeof MatchTileSide)[keyof typeof MatchTileSide]

export type MatchAttemptTile = {
  cardId: string
  side: MatchTileSide
}

export type MatchAttempt = {
  attemptId: string
  first: MatchAttemptTile
  second: MatchAttemptTile
}

export type MatchCompletion = {
  sessionId: string
  durationMs: number
  cardCount: number
  completedAt: string
  bestResult: MatchLeaderboardEntry
}

export type MatchLeaderboard = {
  data: MatchLeaderboardEntry[]
  meta: import('@/shared/api').PaginationMeta
  currentUserBest: MatchLeaderboardEntry | null
}
