'use client'

import { useCallback, useRef, useState } from 'react'
import { useAction } from '@/shared/lib'
import { toggleStarAction } from '@/features/study-vocab/server'

export function useDeckBoard(deckId: string) {
  const pendingStarsRef = useRef(new Set<string>())
  const [pendingStars, setPendingStars] = useState<ReadonlySet<string>>(
    new Set()
  )

  const [starOverrides, setStarOverrides] = useState<Record<string, boolean>>(
    {}
  )

  const [previewIndex, setPreviewIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [search, setSearch] = useState('')
  const { execute: saveStar } = useAction(toggleStarAction)

  const movePreview = useCallback((direction: -1 | 1, cardCount: number) => {
    setPreviewIndex((current) => {
      if (cardCount === 0) return 0

      return (current + direction + cardCount) % cardCount
    })
    setIsFlipped(false)
  }, [])

  const toggleStar = useCallback(
    async (cardId: string, currentValue: boolean) => {
      if (pendingStarsRef.current.has(cardId)) return
      pendingStarsRef.current.add(cardId)
      setPendingStars(new Set(pendingStarsRef.current))
      setStarOverrides((current) => ({ ...current, [cardId]: !currentValue }))
      try {
        const result = await saveStar({
          cardId,
          isStarred: !currentValue,
        })

        setStarOverrides((current) => ({
          ...current,
          [cardId]: result?.isStarred ?? currentValue,
        }))

        return result
      } finally {
        pendingStarsRef.current.delete(cardId)
        setPendingStars(new Set(pendingStarsRef.current))
      }
    },
    [deckId, saveStar]
  )

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
  }, [])

  const clearStarOverride = useCallback((cardId: string) => {
    setStarOverrides((current) => {
      if (!(cardId in current)) return current
      const { [cardId]: _, ...remaining } = current

      return remaining
    })
  }, [])

  const flipPreview = useCallback(() => {
    setIsFlipped((current) => !current)
  }, [])

  return {
    pendingStars,
    starOverrides,
    previewIndex,
    isFlipped,
    search,
    setSearch: handleSearchChange,
    flipPreview,
    movePreview,
    toggleStar,
    clearStarOverride,
  }
}
