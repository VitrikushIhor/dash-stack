'use client'

import { type StudyCard } from '@/entities/vocab'
import { DeckCardListContent } from './deck-card-list-content'
import { DeckCardListEmptyState } from './deck-card-list-empty-state'
import { DeckCardListHeader } from './deck-card-list-header'

type DeckCardListProps = {
  pendingStars?: ReadonlySet<string>
  totalCardCount: number
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
  onSearchChange: (value: string) => void
  onToggleStar: (cardId: string, isStarred: boolean) => void
  search: string
}

export const DeckCardList = (props: DeckCardListProps) => {
  const {
    totalCardCount,
    filteredTotalCardCount,
    search,
    isSearchPending,
    isSearchError,
  } = props

  const hasSearch = search.trim().length > 0

  const isEmpty =
    !isSearchError && !isSearchPending && filteredTotalCardCount === 0

  return (
    <section
      className='mt-10'
      aria-labelledby='deck-cards-title'
      aria-busy={isSearchPending}
    >
      <DeckCardListHeader
        totalCardCount={totalCardCount}
        search={search}
        isSearchPending={isSearchPending}
        onSearchChange={props.onSearchChange}
      />

      <DeckCardListContent {...props} />

      {isEmpty && <DeckCardListEmptyState hasSearch={hasSearch} />}
    </section>
  )
}
