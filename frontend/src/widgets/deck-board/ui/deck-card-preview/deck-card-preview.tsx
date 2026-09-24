'use client'

import { type StudyCard } from '@/entities/vocab'
import { DeckCardPreviewContent } from './deck-card-preview-content'
import { DeckCardPreviewControls } from './deck-card-preview-controls'
import { DeckCardPreviewHeader } from './deck-card-preview-header'

type DeckCardPreviewProps = {
  card: StudyCard | null
  cardCount: number
  currentIndex: number
  isAuthenticated: boolean
  isFlipped: boolean
  isStarPending?: boolean
  onFlip: () => void
  onMove: (direction: -1 | 1) => void
  onPronounce: (text: string) => void
  onToggleStar: (cardId: string, isStarred: boolean) => void
}

export function DeckCardPreview({
  card,
  cardCount,
  currentIndex,
  isAuthenticated,
  isFlipped,
  isStarPending = false,
  onFlip,
  onMove,
  onPronounce,
  onToggleStar,
}: DeckCardPreviewProps) {
  return (
    <div className='bg-card rounded-2xl border p-4 shadow-sm sm:p-6'>
      <DeckCardPreviewHeader
        cardCount={cardCount}
        currentIndex={currentIndex}
        hasCard={Boolean(card)}
      />

      <DeckCardPreviewContent
        card={card}
        isFlipped={isFlipped}
        onFlip={onFlip}
      />

      <DeckCardPreviewControls
        card={card}
        isAuthenticated={isAuthenticated}
        isStarPending={isStarPending}
        onMove={onMove}
        onPronounce={onPronounce}
        onToggleStar={onToggleStar}
      />
    </div>
  )
}
