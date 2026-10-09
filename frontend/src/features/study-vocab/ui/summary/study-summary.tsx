'use client'

import { StudyMode } from '@/entities/vocab'
import { type FlashcardProgressStatus } from '../../model/flashcards/session/flashcard-progress.contract'
import { type FlashcardResult } from '../../model/shared/types'
import { FlashcardsSummary } from './flashcards-summary'
import { GuestStudySaveProgressCta } from './guest-study-save-progress-cta'
import { MatchSummary } from './match-summary'
import { ProgressSyncStatus } from './progress-sync-status'
import { StudySummaryActions } from './study-summary-actions'
import { StudySummaryLayout } from './study-summary-layout'

interface BaseSummaryProps {
  onRestart?: () => void
  isSubmitting?: boolean
  deckId?: string
}

interface CardsSummaryProps extends BaseSummaryProps {
  kind: typeof StudyMode.FLASHCARDS
  results: FlashcardResult[]
  onRetryIncorrect?: () => void
  progressStatus?: FlashcardProgressStatus
  progressError?: string | null
  onRetryProgress?: () => void
}

interface MatchSummaryProps extends BaseSummaryProps {
  kind: typeof StudyMode.MATCH
  matchDurationMs: number
}

type StudySummaryProps = CardsSummaryProps | MatchSummaryProps

export function StudySummary(props: StudySummaryProps) {
  if (props.kind === StudyMode.MATCH) {
    return (
      <StudySummaryLayout
        actions={
          <StudySummaryActions
            onRestart={props.onRestart}
            isSubmitting={props.isSubmitting}
          />
        }
      >
        <MatchSummary durationMs={props.matchDurationMs} />
        <GuestStudySaveProgressCta />
      </StudySummaryLayout>
    )
  }

  const hasIncorrect = props.results.some((result) => !result.isCorrect)

  return (
    <StudySummaryLayout
      actions={
        <StudySummaryActions
          onRestart={props.onRestart}
          isSubmitting={props.isSubmitting}
          onRetryIncorrect={hasIncorrect ? props.onRetryIncorrect : undefined}
        />
      }
    >
      <FlashcardsSummary results={props.results} />
      <GuestStudySaveProgressCta />
      <ProgressSyncStatus
        status={props.progressStatus}
        error={props.progressError}
        onRetry={props.onRetryProgress}
      />
    </StudySummaryLayout>
  )
}
