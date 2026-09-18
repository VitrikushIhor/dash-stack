import { type StudyCard } from '@/entities/vocab'
import type {
  LearnAnswerKind,
  LearnPhase,
  LearnStage,
} from './adaptive-session.constants'

type LearnStage = (typeof LearnStage)[keyof typeof LearnStage]
export type LearnPhase = (typeof LearnPhase)[keyof typeof LearnPhase]

export type LearnMastery =
  | { stage: typeof LearnStage.Mcq | typeof LearnStage.Typing; streak: 0 | 1 }
  | { stage: typeof LearnStage.Mastered }

export type LearnCardState = {
  id: string
  requiresMcq: boolean
  mastery: LearnMastery
  incorrectCount: number
}

export type AdaptiveLearnSession = {
  sessionId: string
  cards: LearnCardState[]
  currentIndex: number
  questionId: string
  attemptCount: number
  phase: LearnPhase
}

export type LearnChoice = { id: string; definition: string }

export type LearnAnswer =
  | { kind: typeof LearnAnswerKind.Mcq; choiceId: string }
  | { kind: typeof LearnAnswerKind.Typing; value: string }

export type LearnAnswerEvaluation =
  | { kind: 'exact' | 'normalized' | 'almost'; isCorrect: true }
  | { kind: 'incorrect'; isCorrect: false }

export type LearnFeedback = {
  answer: string
  kind: LearnAnswerEvaluation['kind']
  sync: 'pending' | 'saved' | 'guest'
}

export type LearnFeedbackSync = LearnFeedback['sync']

export type LearnSnapshot = {
  version: 1
  cards: StudyCard[]
  session: AdaptiveLearnSession
  choices: LearnChoice[] | null
  feedback: LearnFeedback | null
}

export type AdaptiveLearnStore = {
  snapshot: LearnSnapshot | null
  error: string | null
  isSyncing: boolean
  syncingAttemptId: string | null
  resumedAttemptId: string | null
  persist: (snapshot: LearnSnapshot) => void
  persistIfCurrent: (
    attemptId: string,
    snapshot: LearnSnapshot,
    lease: number
  ) => boolean
  setError: (error: unknown | null) => void
  setErrorIfActive: (error: unknown | null, lease: number) => boolean
  beginAnswer: () => number | null
  finishAnswer: (lease: number) => void
  beginSync: (attemptId: string) => number | null
  finishSync: (attemptId: string, lease: number) => void
  consumeResumedAttempt: (attemptId: string, lease: number) => void
  activate: () => number
  deactivate: (lease: number) => void
}

export type CreateAdaptiveLearnStoreParams = {
  storageKey: string
  deckId: string
}

export type LearnProgressSyncParams = Pick<
  AdaptiveLearnStore,
  | 'persistIfCurrent'
  | 'setErrorIfActive'
  | 'beginSync'
  | 'finishSync'
  | 'consumeResumedAttempt'
  | 'resumedAttemptId'
  | 'snapshot'
  | 'isSyncing'
> & {
  deckId: string
  isIdentityLoading: boolean
  shouldSync: boolean
}

export type MultipleChoiceShortcutsOptions = {
  optionsCount: number
  isDisabled: boolean
  onSelectIndex: (index: number) => void
}
