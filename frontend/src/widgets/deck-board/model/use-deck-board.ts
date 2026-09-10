'use client'

import { useCallback, useState } from 'react'
import { useAction } from '@/shared/lib'
import { toggleStarAction } from '@/features/study-vocab/server'

export function useDeckBoard(deckId: string) {
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
      return saveStar({ deckId, cardId, isStarred: !currentValue })
    },
    [deckId, saveStar]
  )

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
  }, [])
  const flipPreview = useCallback(() => {
    setIsFlipped((current) => !current)
  }, [])

  return {
    previewIndex,
    isFlipped,
    search,
    setSearch: handleSearchChange,
    flipPreview,
    movePreview,
    toggleStar,
  }
}
