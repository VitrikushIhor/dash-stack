'use client'

import { useCallback } from 'react'
import { EmptyState, WidgetErrorState } from '@/shared/ui/feedback'
import { SearchInput } from '@/shared/ui/search-input'
import { type StudyCard } from '@/entities/vocab'
import { useDeckCardListVirtualization } from '../../model/use-deck-card-list-virtualization'
import { DeckCardListLoadState } from './deck-card-list-load-state'
import { DeckCardListSkeleton } from './deck-card-list-skeleton'
import { DeckCardRow } from './deck-card-row'

type DeckCardListProps = {
  cardCount: number
  cards: StudyCard[]
  filteredCardCount: number
  hasNextPage: boolean
  isAuthenticated: boolean
  isFetchingNextPage: boolean
  isNextPageError: boolean
  isSearchError: boolean
  isSearchPending: boolean
  onLoadMore: () => void
  onRetryNextPage: () => void
  onRetrySearch: () => void
  onSearchChange: (value: string) => void
  onToggleStar: (cardId: string, isStarred: boolean) => void
  search: string
}

export function DeckCardList({
  cardCount,
  cards,
  filteredCardCount,
  hasNextPage,
  isAuthenticated,
  isFetchingNextPage,
  isNextPageError,
  isSearchError,
  isSearchPending,
  onLoadMore,
  onRetryNextPage,
  onRetrySearch,
  onSearchChange,
  onToggleStar,
  search,
}: DeckCardListProps) {
  const { handleScroll, scrollContainerRef, shouldVirtualize, virtualizer } =
    useDeckCardListVirtualization({
      cards,
      filteredCardCount,
      hasNextPage,
      isFetchingNextPage,
      onLoadMore,
    })
  const hasSearch = search.trim().length > 0

  const renderCard = useCallback(
    (card: StudyCard) => (
      <DeckCardRow
        key={card.id}
        card={card}
        isAuthenticated={isAuthenticated}
        onToggleStar={onToggleStar}
      />
    ),
    [isAuthenticated, onToggleStar]
  )

  return (
    <section
      className='mt-10'
      aria-labelledby='deck-cards-title'
      aria-busy={isSearchPending}
    >
      <div className='mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h2 id='deck-cards-title' className='text-xl font-semibold'>
            Cards in this deck
          </h2>
          <p className='text-muted-foreground mt-1 text-sm'>
            {cardCount} terms
          </p>
        </div>
        <SearchInput
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder='Search terms or definitions'
          aria-label='Search cards'
          isPending={isSearchPending}
          wrapperClassName='sm:max-w-sm'
        />
      </div>
      {isSearchError ? (
        <WidgetErrorState
          title='Could not load cards.'
          description='Check your connection and try the search again.'
          onRetry={onRetrySearch}
        />
      ) : isSearchPending ? (
        <DeckCardListSkeleton count={3} label='Searching cards' />
      ) : shouldVirtualize ? (
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
                  style={{ transform: `translateY(${virtualCard.start}px)` }}
                >
                  {renderCard(card)}
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
      ) : (
        <div className='space-y-3'>{cards.map(renderCard)}</div>
      )}
      {!isSearchError && !isSearchPending && filteredCardCount === 0 ? (
        <EmptyState
          title={
            hasSearch
              ? 'No cards match this search.'
              : 'This deck has no cards yet.'
          }
          description={
            hasSearch ? 'Try another term or definition.' : undefined
          }
          className='p-8'
        />
      ) : null}
    </section>
  )
}
