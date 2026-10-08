import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import { FlashcardProgressStatus } from '../../model/flashcards/session/flashcard-progress.contract'

interface ProgressSyncStatusProps {
  status?: FlashcardProgressStatus
  error?: string | null
  onRetry?: () => void
}

export function ProgressSyncStatus({
  status: progressStatus,
  error: progressError,
  onRetry: onRetryProgress,
}: ProgressSyncStatusProps) {
  if (progressStatus === FlashcardProgressStatus.SAVING) {
    return (
      <output className='text-muted-foreground mb-6 flex items-center gap-2 text-sm'>
        <Loader2 className='h-4 w-4 animate-spin' />
        Saving each answer securely…
      </output>
    )
  }

  if (progressStatus === FlashcardProgressStatus.WAITING_FOR_IDENTITY) {
    return (
      <output className='text-muted-foreground mb-6 flex items-center gap-2 text-sm'>
        <Loader2 className='h-4 w-4 animate-spin' />
        Checking whether this progress can be saved…
      </output>
    )
  }

  if (progressStatus !== FlashcardProgressStatus.ERROR) return null

  return (
    <div
      className='border-destructive/30 bg-destructive/10 mb-6 w-full rounded-lg border p-4 text-left'
      role='alert'
    >
      <div className='text-destructive flex gap-2 text-sm font-medium'>
        <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
        Your answers are saved on this device but could not be synced.
      </div>
      {progressError && (
        <p className='text-muted-foreground mt-2 text-sm'>{progressError}</p>
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
  )
}
