'use client'

import { useCallback, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

const VIRTUALIZATION_THRESHOLD = 50
const ESTIMATED_CARD_HEIGHT_PX = 104
const LOAD_MORE_DISTANCE_PX = 300

function estimateCardHeight() {
  return ESTIMATED_CARD_HEIGHT_PX
}

type VirtualizedCard = {
  id: string
}

type UseDeckCardListVirtualizationParams = {
  cards: VirtualizedCard[]
  filteredCardCount: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
}

export function useDeckCardListVirtualization({
  cards,
  filteredCardCount,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: UseDeckCardListVirtualizationParams) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const shouldVirtualize = filteredCardCount > VIRTUALIZATION_THRESHOLD
  const getScrollElement = useCallback(() => scrollContainerRef.current, [])
  const getItemKey = useCallback(
    (index: number) => cards[index]?.id ?? index,
    [cards]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: cards.length,
    enabled: shouldVirtualize,
    getScrollElement,
    getItemKey,
    estimateSize: estimateCardHeight,
    overscan: 6,
  })

  const handleScroll = useCallback(() => {
    const element = scrollContainerRef.current
    if (
      !element ||
      !hasNextPage ||
      isFetchingNextPage ||
      element.scrollHeight - element.scrollTop - element.clientHeight >=
        LOAD_MORE_DISTANCE_PX
    ) {
      return
    }
    onLoadMore()
  }, [hasNextPage, isFetchingNextPage, onLoadMore])

  return {
    handleScroll,
    scrollContainerRef,
    shouldVirtualize,
    virtualizer,
  }
}
