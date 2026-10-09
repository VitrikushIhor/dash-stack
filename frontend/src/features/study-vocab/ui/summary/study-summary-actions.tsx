import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, RotateCcw } from 'lucide-react'
import { ROUTES } from '@/shared/config/constants/routes'
import { Button } from '@/shared/ui/core/button'

interface StudySummaryActionsProps {
  onRestart?: () => void
  onRetryIncorrect?: () => void
  isSubmitting?: boolean
}

export function StudySummaryActions({
  onRestart,
  onRetryIncorrect,
  isSubmitting = false,
}: StudySummaryActionsProps) {
  const router = useRouter()
  return (
    <div className='flex w-full flex-col gap-3 sm:flex-row'>
      {onRetryIncorrect && (
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
  )
}
