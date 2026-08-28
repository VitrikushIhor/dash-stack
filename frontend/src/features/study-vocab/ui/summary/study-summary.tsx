'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, RotateCcw, Trophy } from 'lucide-react'
import { ROUTES } from '@/shared/config/constants/routes'
import { Button } from '@/shared/ui/core/button'

interface StudySummaryProps {
  deckId: string
  results?: { flashcardId: string; isCorrect: boolean }[]
  onRetryIncorrect?: () => void
  onRestart?: () => void
  isMatchGame?: boolean
  matchDurationMs?: number
  isSubmitting?: boolean
}

function formatDuration(ms: number) {
  const totalSeconds = (ms / 1000).toFixed(1)
  return `${totalSeconds}s`
}

export function StudySummary({
  deckId,
  results = [],
  onRetryIncorrect,
  onRestart,
  isMatchGame = false,
  matchDurationMs = 0,
  isSubmitting = false,
}: StudySummaryProps) {
  const router = useRouter()

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

        {isMatchGame ? (
          <div className='bg-muted/50 mb-8 w-full rounded-xl p-6'>
            <div className='text-muted-foreground mb-1 text-sm font-medium'>
              Completion Time
            </div>
            <div className='text-primary font-mono text-4xl font-extrabold'>
              {formatDuration(matchDurationMs)}
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
