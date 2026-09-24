import { WidgetErrorState } from '@/shared/ui/feedback'
import { type StudyCard } from '@/entities/vocab'
import { useDeckCardListVirtualization } from '../../model/use-deck-card-list-virtualization'
import { DeckCardRow } from '../deck-card-row'
import { DeckCardListLoadState } from './deck-card-list-load-state'
import { DeckCardListSkeleton } from './deck-card-list-skeleton'

type DeckCardListProps = {
  pendingStars?: ReadonlySet<string>

  cards: StudyCard[]
  filteredTotalCardCount: number
  hasNextPage: boolean
  isAuthenticated: boolean
  isFetchingNextPage: boolean
  isNextPageError: boolean
  isSearchError: boolean
  isSearchPending: boolean
  onLoadMore: () => void
  onRetryNextPage: () => void
  onRetrySearch: () => void
  onToggleStar: (cardId: string, isStarred: boolean) => void
}

export const DeckCardListContent = (props: DeckCardListProps) => {
  const {
    cards,
    filteredTotalCardCount,
    hasNextPage,
    isFetchingNextPage,
    isNextPageError,
    isSearchError,
    isSearchPending,
    onLoadMore,
    onRetryNextPage,
    onRetrySearch,
    isAuthenticated,
    onToggleStar,
    pendingStars,
  } = props

  const { handleScroll, scrollContainerRef, shouldVirtualize, virtualizer } =
    useDeckCardListVirtualization({
      cards,
      filteredTotalCardCount,
      hasNextPage,
      isFetchingNextPage,
      onLoadMore,
    })

  if (isSearchError) {
    return (
      <WidgetErrorState
        title='Could not load cards.'
        description='Check your connection and try the search again.'
        onRetry={onRetrySearch}
      />
    )
  }

  if (isSearchPending) {
    return <DeckCardListSkeleton count={3} label='Searching cards' />
  }

  if (!shouldVirtualize) {
    return (
      <div className='space-y-3'>
        {cards.map((card) => (
          <DeckCardRow
            key={card.id}
            card={card}
            isStarPending={pendingStars?.has(card.id)}
            isAuthenticated={isAuthenticated}
            onToggleStar={onToggleStar}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      ref={scrollContainerRef}
      aria-label='Cards in this deck'
      className='max-h-[70vh] overflow-y-auto pr-2'
      onScroll={handleScroll}
    >
      <div
        className='relative w-full'
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((virtualCard) => {
          const card = cards[virtualCard.index]

          if (!card) return null

          return (
            <div
              key={virtualCard.key}
              ref={virtualizer.measureElement}
              data-index={virtualCard.index}
              className='absolute top-0 left-0 w-full pb-3'
              style={{
                transform: `translateY(${virtualCard.start}px)`,
              }}
            >
              <DeckCardRow
                card={card}
                isStarPending={pendingStars?.has(card.id)}
                isAuthenticated={isAuthenticated}
                onToggleStar={onToggleStar}
              />
            </div>
          )
        })}
      </div>

      <DeckCardListLoadState
        isError={isNextPageError}
        isLoading={isFetchingNextPage}
        onRetry={onRetryNextPage}
      />
    </div>
  )
}
