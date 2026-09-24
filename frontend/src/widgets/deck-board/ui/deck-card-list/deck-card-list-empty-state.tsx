import { EmptyState } from '@/shared/ui/feedback'

type DeckCardListEmptyStateProps = {
  hasSearch: boolean
}

export function DeckCardListEmptyState({
  hasSearch,
}: DeckCardListEmptyStateProps) {
  return (
    <EmptyState
      title={
        hasSearch
          ? 'No cards match this search.'
          : 'This deck has no cards yet.'
      }
      description={hasSearch ? 'Try another term or definition.' : undefined}
      className='p-8'
    />
  )
}
