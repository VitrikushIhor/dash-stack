import { type StudyCard } from '@/entities/vocab'
import type {
  LearnPhase,
  LearnStage,
} from './session/adaptive-session.constants'
import {
  type LearnChoice,
  type LearnSnapshot,
} from './session/adaptive-session.contract'

export type AdaptiveLearnPlayerProps = {
  deckId: string
  cards: StudyCard[]
  sessionKey?: string
}

export type AdaptiveLearnQuestionProps = {
  card: StudyCard
  choices: LearnChoice[]
  phase: typeof LearnPhase.Question | typeof LearnPhase.Feedback
  stage: typeof LearnStage.Mcq | typeof LearnStage.Typing
  isSyncing: boolean
  feedback: LearnSnapshot['feedback']
  onSelectChoice: (choiceId: string) => void
  onSubmitTyping: (value: string) => void
}

export type AdaptiveLearnFeedbackProps = {
  feedback: LearnSnapshot['feedback']
  correctAnswer: string
  error: string | null
  onRetry: () => void
}

export type AdaptiveLearnIdleProps = {
  hasCards: boolean
  error: string | null
  onStart: () => void
  onRetry: () => void
}

export type AdaptiveLearnCompleteProps = {
  masteredCount: number
  attemptCount: number
  onRestart: () => void
}
