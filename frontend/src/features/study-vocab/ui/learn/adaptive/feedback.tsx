import { WidgetErrorState } from '@/shared/ui/feedback'
import { type AdaptiveLearnFeedbackProps } from '../../../model/learn/adaptive-player.contract'

export function AdaptiveLearnFeedback({
  feedback,
  correctAnswer,
  error,
  onRetry,
}: AdaptiveLearnFeedbackProps) {
  return (
    <>
      {feedback && (
        <div
          role={feedback.kind === 'incorrect' ? 'alert' : 'status'}
          className={`mt-5 rounded-xl border p-4 text-center ${
            feedback.kind === 'incorrect'
              ? 'border-red-500 bg-red-500/10 text-red-700'
              : 'border-emerald-500 bg-emerald-500/10 text-emerald-700'
          }`}
        >
          <p className='font-semibold'>
            {feedback.kind === 'almost'
              ? 'Almost correct!'
              : feedback.kind === 'incorrect'
                ? 'Incorrect'
                : 'Correct!'}
          </p>
          {(feedback.kind === 'almost' || feedback.kind === 'incorrect') && (
            <p className='text-muted-foreground mt-1 text-sm'>
              Correct answer:{' '}
              <strong className='text-foreground'>{correctAnswer}</strong>
            </p>
          )}
          {feedback.sync === 'pending' && (
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
