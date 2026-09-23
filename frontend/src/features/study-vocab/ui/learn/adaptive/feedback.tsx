import { cn } from '@/shared/lib/utils'
import { WidgetErrorState } from '@/shared/ui/feedback'
import { type AdaptiveLearnFeedbackProps } from '../../../model/learn/adaptive-player.contract'
import {
  LearnAnswerEvaluationKind,
  LearnFeedbackSyncState,
} from '../../../model/learn/session/adaptive-session.constants'

export function AdaptiveLearnFeedback({
  feedback,
  correctAnswer,
  error,
  onRetry,
}: AdaptiveLearnFeedbackProps) {
  const isIncorrect = feedback?.kind === LearnAnswerEvaluationKind.Incorrect
  const isAlmostCorrect = feedback?.kind === LearnAnswerEvaluationKind.Almost
  const feedbackLabel = getFeedbackLabel(isAlmostCorrect, isIncorrect)

  return (
    <>
      {feedback && (
        <div
          role={isIncorrect ? 'alert' : 'status'}
          className={cn('mt-5 rounded-xl border p-4 text-center', {
            'border-red-500 bg-red-500/10 text-red-700': isIncorrect,
            'border-emerald-500 bg-emerald-500/10 text-emerald-700':
              !isIncorrect,
          })}
        >
          <p className='font-semibold'>{feedbackLabel}</p>
          {(isAlmostCorrect || isIncorrect) && (
            <p className='text-muted-foreground mt-1 text-sm'>
              Correct answer:{' '}
              <strong className='text-foreground'>{correctAnswer}</strong>
            </p>
          )}
          {feedback.sync === LearnFeedbackSyncState.Pending && (
            <p className='text-muted-foreground mt-2 text-sm'>
              Saving progress…
            </p>
          )}
        </div>
      )}

      {error && (
        <WidgetErrorState
          className='mt-5'
          title='Progress was not saved'
          description={error}
          onRetry={onRetry}
        />
      )}
    </>
  )
}

function getFeedbackLabel(
  isAlmostCorrect: boolean,
  isIncorrect: boolean
): string {
  if (isAlmostCorrect) return 'Almost correct!'
  if (isIncorrect) return 'Incorrect'

  return 'Correct!'
}
