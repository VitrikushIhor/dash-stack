import { WidgetErrorState } from '@/shared/ui/feedback'
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
    <WidgetErrorState
      className='mt-3'
      title='Could not load more cards'
      description='Try loading more cards again.'
      onRetry={onRetry}
    />
  )
}
