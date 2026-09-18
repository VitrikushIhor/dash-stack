'use client'

import { useCallback, useMemo } from 'react'
import { useSpeech } from '@/shared/lib/hooks/use-speech'
import {
  type DeckCardsPage,
  type StudyCard,
  useDeckCards,
} from '@/entities/vocab'
import { useStudySearchParams } from '@/features/study-vocab'
import { useDeckBoard } from './use-deck-board'

const GUEST_FILTERS = { onlyDue: false, onlyStarred: false } as const

type UseDeckBoardViewModelParams = {
  deckId: string
  initialCardsPage: DeckCardsPage
  initialCardCount: number | null | undefined
  isAuthenticated: boolean
}

export function useDeckBoardViewModel({
  deckId,
  initialCardsPage,
  initialCardCount,
  isAuthenticated,
}: UseDeckBoardViewModelParams) {
  const board = useDeckBoard(deckId)
  const previewCards = useDeckCards(deckId, '', initialCardsPage)
  const deckCards = useDeckCards(deckId, board.search, initialCardsPage)
  const { filters, setFilters, isPending } = useStudySearchParams()
  const { speak } = useSpeech({ lang: 'en-US' })
  const effectiveFilters = isAuthenticated ? filters : GUEST_FILTERS
  const previewCardItems = previewCards.cards
  const previewHasNextPage = previewCards.hasNextPage
  const fetchNextPreviewPage = previewCards.fetchNextPage
  const movePreview = board.movePreview
  const toggleStar = board.toggleStar
  const setCardStarred = deckCards.setCardStarred
  const fetchNextDeckPage = deckCards.fetchNextPage
  const retrySearch = deckCards.retrySearch
  const retryNextPage = deckCards.retryNextPage
  const normalizedPreviewIndex = previewCardItems.length
    ? Math.min(board.previewIndex, previewCardItems.length - 1)
    : 0

  const selectedCount = useMemo(() => {
    if (effectiveFilters.onlyDue && effectiveFilters.onlyStarred) {
      return deckCards.summary.dueAndStarred
    }
    if (effectiveFilters.onlyDue) return deckCards.summary.due
    if (effectiveFilters.onlyStarred) return deckCards.summary.starred

    return deckCards.summary.total
  }, [
    deckCards.summary,
    effectiveFilters.onlyDue,
    effectiveFilters.onlyStarred,
  ])

  const handleMovePreview = useCallback(
    async (direction: -1 | 1) => {
      if (
        direction === 1 &&
        normalizedPreviewIndex === previewCardItems.length - 1 &&
        previewHasNextPage
      ) {
        const result = await fetchNextPreviewPage()
        if (result.isError) return
        const loadedCardCount =
          result.data?.pages.reduce(
            (total, page) => total + page.data.length,
            0
          ) ?? previewCardItems.length

        movePreview(direction, loadedCardCount)

        return
      }

      movePreview(direction, previewCardItems.length)
    },
    [
      fetchNextPreviewPage,
      movePreview,
      normalizedPreviewIndex,
      previewCardItems.length,
      previewHasNextPage,
    ]
  )

  const handleToggleStar = useCallback(
    async (cardId: string, isStarred: boolean) => {
      const result = await toggleStar(cardId, isStarred)
      if (result === undefined) return
      setCardStarred(cardId, result.isStarred)
      board.clearStarOverride(cardId)
    },
    [board, setCardStarred, toggleStar]
  )

  const handleLoadMore = useCallback(() => {
    void fetchNextDeckPage()
  }, [fetchNextDeckPage])

  const handleRetrySearch = useCallback(() => {
    void retrySearch()
  }, [retrySearch])

  const handleRetryNextPage = useCallback(() => {
    void retryNextPage()
  }, [retryNextPage])

  const withStarOverride = (card: StudyCard): StudyCard => ({
    ...card,
    progress: {
      ...card.progress,
      isStarred: board.starOverrides[card.id] ?? card.progress.isStarred,
    },
  })

  const previewCard = previewCardItems[normalizedPreviewIndex]

  return {
    cardCount: initialCardCount ?? deckCards.summary.total,
    preview: {
      card: previewCard ? withStarOverride(previewCard) : null,
      isStarPending: previewCard
        ? board.pendingStars.has(previewCard.id)
        : false,
      cardCount: previewCards.summary.total,
      currentIndex: normalizedPreviewIndex,
      isFlipped: board.isFlipped,
      onFlip: board.flipPreview,
      onMove: handleMovePreview,
      onPronounce: speak,
      onToggleStar: handleToggleStar,
    },
    practice: {
      dueCount: deckCards.summary.due,
      filters: effectiveFilters,
      isPending,
      onFiltersChange: setFilters,
      selectedCount,
      starredCount: deckCards.summary.starred,
    },
    cardList: {
      cards: deckCards.cards.map(withStarOverride),
      pendingStars: board.pendingStars,
      filteredCardCount: deckCards.meta.total,
      hasNextPage: deckCards.hasNextPage,
      isFetchingNextPage: deckCards.isFetchingNextPage,
      isNextPageError: deckCards.isNextPageError,
      isSearchError: deckCards.isError,
      isSearchPending: deckCards.isSearchPending,
      onLoadMore: handleLoadMore,
      onRetryNextPage: handleRetryNextPage,
      onRetrySearch: handleRetrySearch,
      onSearchChange: board.setSearch,
      onToggleStar: handleToggleStar,
      search: board.search,
    },
  }
}
