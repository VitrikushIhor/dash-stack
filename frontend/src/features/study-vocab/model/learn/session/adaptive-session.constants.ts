export const LearnStage = {
  Mcq: 'mcq',
  Typing: 'typing',
  Mastered: 'mastered',
} as const

export const LearnPhase = {
  Question: 'question',
  Feedback: 'feedback',
  Complete: 'complete',
} as const

export const LearnAnswerKind = {
  Mcq: 'mcq',
  Typing: 'typing',
} as const

export const LearnAnswerEvaluationKind = {
  Exact: 'exact',
  Normalized: 'normalized',
  Almost: 'almost',
  Incorrect: 'incorrect',
} as const

export const LearnFeedbackSyncState = {
  Pending: 'pending',
  Saved: 'saved',
  Guest: 'guest',
} as const

export const LearnSnapshotReconciliationKind = {
  Reconciled: 'reconciled',
  RebuildRequired: 'rebuild-required',
} as const

export const LearnSnapshotRebuildReason = {
  PendingCardDeleted: 'pending-card-deleted',
  CardSetChanged: 'card-set-changed',
} as const
