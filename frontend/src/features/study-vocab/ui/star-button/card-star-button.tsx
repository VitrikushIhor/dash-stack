'use client'

import React from 'react'
import { type StudyCard } from '@/entities/vocab'
import { useStarCard } from '@/features/study-vocab/model/shared/use-star-card'
import { StarButton } from './star-button'

interface CardStarButtonProps {
  card: StudyCard
}

export function CardStarButton({ card }: CardStarButtonProps) {
  const { isStarred, toggleStar, isPending, isDisabled } = useStarCard(
    card.deckId,
    card.id,
    card.progress.isStarred
  )

  return (
    <StarButton
      isStarred={isStarred}
      onClick={toggleStar}
      disabled={isDisabled}
      isPending={isPending}
    />
  )
}
