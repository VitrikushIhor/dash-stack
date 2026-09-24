import { CheckCircle2, RotateCcw } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import { WidgetErrorState } from '@/shared/ui/feedback'
import {
  type AdaptiveLearnCompleteProps,
  type AdaptiveLearnIdleProps,
} from '../../../model/learn/adaptive-player.contract'
import { StudyEmptyState } from '../../shared/study-empty-state'
import { GuestStudySaveProgressCta } from '../../summary/guest-study-save-progress-cta'

export function AdaptiveLearnIdle({ error, onRetry }: AdaptiveLearnIdleProps) {
  if (error) {
    return (
      <WidgetErrorState
        title='Unable to restore Learn session'
        description={error}
        onRetry={onRetry}
      />
    )
  }

  return (
    <StudyEmptyState
      title='No cards match these filters'
      description='Try All cards or change the study filters. Unseen cards are not due until you review them.'
    />
  )
}

export function AdaptiveLearnComplete({
  masteredCount,
  attemptCount,
  onRestart,
}: AdaptiveLearnCompleteProps) {
  return (
    <div className='mx-auto flex min-h-150 max-w-xl flex-col items-center justify-center px-6 text-center'>
      <CheckCircle2 className='mb-4 h-12 w-12 text-emerald-600' />
      <h2 className='text-3xl font-bold'>Session Complete!</h2>
      <p className='text-muted-foreground mt-3'>
        {masteredCount} cards mastered in {attemptCount} attempts.
      </p>
      <div className='mt-6 w-full'>
        <GuestStudySaveProgressCta />
      </div>
      <Button variant='outline' className='mt-6 gap-2' onClick={onRestart}>
        <RotateCcw className='h-4 w-4' /> Start again
      </Button>
    </div>
  )
}
