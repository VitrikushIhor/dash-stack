'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  RotateCcw,
  Trophy,
} from 'lucide-react'
import { ROUTES } from '@/shared/config/constants/routes'
import { formatTime } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/core/button'
import { StudyMode } from '@/entities/vocab'
import {
  FlashcardProgressStatus,
  type FlashcardProgressStatus as FlashcardProgressStatusValue,
} from '../../model/flashcards/session/use-flashcard-progress-sync'
import { GuestStudySaveProgressCta } from './guest-study-save-progress-cta'

interface BaseSummaryProps {
  onRestart?: () => void
  isSubmitting?: boolean
  progressStatus?: FlashcardProgressStatusValue
  progressError?: string | null
  onRetryProgress?: () => void
  deckId?: string
}

interface CardsSummaryProps extends BaseSummaryProps {
  kind?: typeof StudyMode.FLASHCARDS
  results: { flashcardId: string; isCorrect: boolean }[]
  onRetryIncorrect?: () => void
  isMatchGame?: false
  matchDurationMs?: never
}

interface MatchSummaryProps extends BaseSummaryProps {
  kind: typeof StudyMode.MATCH
  matchDurationMs: number
  isMatchGame?: true
  results?: never
  onRetryIncorrect?: never
}

type StudySummaryProps = CardsSummaryProps | MatchSummaryProps

export function StudySummary(props: StudySummaryProps) {
  const {
    onRestart,
    isSubmitting = false,
    progressStatus,
    progressError,
    onRetryProgress,
  } = props
  const router = useRouter()

  const isMatch = props.kind === StudyMode.MATCH || Boolean(props.isMatchGame)
  const matchDurationMs =
    isMatch &&
    'matchDurationMs' in props &&
    typeof props.matchDurationMs === 'number'
      ? props.matchDurationMs
      : 0
  const results =
    !isMatch && 'results' in props && props.results ? props.results : []
  const onRetryIncorrect =
    !isMatch && 'onRetryIncorrect' in props ? props.onRetryIncorrect : undefined

  const total = results.length
  const correctCount = results.filter((r) => r.isCorrect).length
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 100
  const hasIncorrect = results.some((r) => !r.isCorrect)

  return (
    <div className='mx-auto flex min-h-150 w-full max-w-xl flex-col items-center justify-center p-6 text-center'>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className='bg-card border-border flex w-full flex-col items-center rounded-2xl border p-8 shadow-lg'
      >
        <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500'>
          <Trophy className='h-10 w-10' />
        </div>

        <h2 className='mb-2 text-3xl font-bold'>Session Complete!</h2>
        <p className='text-muted-foreground mb-8'>
          Great job! Keep reviewing regularly to build long-term memory.
        </p>

        {isMatch ? (
          <div className='bg-muted/50 mb-8 w-full rounded-xl p-6'>
            <div className='text-muted-foreground mb-1 text-sm font-medium'>
              Completion Time
            </div>
            <div className='text-primary font-mono text-4xl font-extrabold'>
              {formatTime(matchDurationMs)}s
            </div>
          </div>
        ) : (
          <div className='mb-8 grid w-full grid-cols-2 gap-4'>
            <div className='bg-muted/50 rounded-xl p-4'>
              <div className='text-muted-foreground mb-1 text-sm font-medium'>
                Accuracy
              </div>
              <div className='text-3xl font-bold text-green-600'>
                {percentage}%
              </div>
            </div>
            <div className='bg-muted/50 rounded-xl p-4'>
              <div className='text-muted-foreground mb-1 text-sm font-medium'>
                Score
              </div>
              <div className='text-3xl font-bold'>
                {correctCount} / {total}
              </div>
            </div>
          </div>
        )}

        <GuestStudySaveProgressCta />

        {!isMatch && progressStatus === FlashcardProgressStatus.SAVING && (
          <output className='text-muted-foreground mb-6 flex items-center gap-2 text-sm'>
            <Loader2 className='h-4 w-4 animate-spin' />
            Saving each answer securely…
          </output>
        )}

        {!isMatch &&
          progressStatus === FlashcardProgressStatus.WAITING_FOR_IDENTITY && (
            <output className='text-muted-foreground mb-6 flex items-center gap-2 text-sm'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Checking whether this progress can be saved…
            </output>
          )}

        {!isMatch && progressStatus === FlashcardProgressStatus.ERROR && (
          <div
            className='border-destructive/30 bg-destructive/10 mb-6 w-full rounded-lg border p-4 text-left'
            role='alert'
          >
            <div className='text-destructive flex gap-2 text-sm font-medium'>
              <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
              Your answers are saved on this device but could not be synced.
            </div>
            {progressError && (
              <p className='text-muted-foreground mt-2 text-sm'>
                {progressError}
              </p>
            )}
            {onRetryProgress && (
              <Button
                className='mt-3'
                variant='outline'
                size='sm'
                onClick={onRetryProgress}
              >
                Retry saving
              </Button>
            )}
          </div>
        )}

        <div className='flex w-full flex-col gap-3 sm:flex-row'>
          {hasIncorrect && onRetryIncorrect && (
            <Button
              variant='outline'
              className='flex-1 gap-2'
              onClick={onRetryIncorrect}
              disabled={isSubmitting}
            >
              <RotateCcw className='h-4 w-4' />
              Practice Missed
            </Button>
          )}

          {onRestart && (
            <Button
              variant='outline'
              className='flex-1 gap-2'
              onClick={onRestart}
              disabled={isSubmitting}
            >
              <RotateCcw className='h-4 w-4' />
              Play Again
            </Button>
          )}

          <Button
            className='flex-1 gap-2'
            onClick={() => router.push(ROUTES.vocabDecks)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Back to Decks</span>
                <ArrowRight className='h-4 w-4' />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
