import { Button } from '@/shared/ui/core/button'
import { DeckCardListSkeleton } from './deck-card-list-skeleton'

type DeckCardListLoadStateProps = {
  isError: boolean
  isLoading: boolean
  onRetry: () => void
}

export function DeckCardListLoadState({
  isError,
  isLoading,
  onRetry,
}: DeckCardListLoadStateProps) {
  if (isLoading) {
    return <DeckCardListSkeleton count={1} label='Loading more cards' />
  }
  if (!isError) return null

  return (
    <div className='py-3 text-center' role='alert'>
      <p className='text-destructive text-sm'>Could not load more cards.</p>
      <Button variant='outline' size='sm' className='mt-2' onClick={onRetry}>
        Retry loading
      </Button>
    </div>
  )
}
