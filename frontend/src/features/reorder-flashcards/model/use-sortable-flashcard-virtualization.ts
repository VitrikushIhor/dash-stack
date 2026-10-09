'use client'

import { useCallback, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

const VIRTUALIZATION_THRESHOLD = 50
const ESTIMATED_CARD_HEIGHT_PX = 260
const OVERSCAN_COUNT = 5

type VirtualizableCard = {
  id: string
}

function estimateCardHeight(): number {
  return ESTIMATED_CARD_HEIGHT_PX
}

export function useSortableFlashcardVirtualization(
  cards: readonly VirtualizableCard[]
) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const shouldVirtualize = cards.length > VIRTUALIZATION_THRESHOLD
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
    overscan: OVERSCAN_COUNT,
  })

  return { scrollContainerRef, shouldVirtualize, virtualizer }
}
