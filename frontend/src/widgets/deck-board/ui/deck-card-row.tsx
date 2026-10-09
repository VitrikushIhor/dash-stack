import { memo } from 'react'
import { type StudyCard } from '@/entities/vocab'
import { StarButton } from '@/features/study-vocab'

type DeckCardRowProps = {
  isStarPending?: boolean
  card: StudyCard
  isAuthenticated: boolean
  onToggleStar: (cardId: string, isStarred: boolean) => void
}

export const DeckCardRow = memo(function DeckCardRow({
  card,
  isAuthenticated,
  onToggleStar,
  isStarPending = false,
}: DeckCardRowProps) {
  return (
    <article className='bg-card grid gap-3 rounded-xl border p-4 shadow-xs sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:items-center'>
      <p className='font-medium'>{card.term}</p>
      <div>
        <p className='text-sm'>{card.definition}</p>
        {card.example ? (
          <p className='text-muted-foreground mt-1 text-xs italic'>
            {card.example}
          </p>
        ) : null}
      </div>
      {isAuthenticated ? (
        <StarButton
          isPending={isStarPending}
          disabled={isStarPending}
          isStarred={card.progress.isStarred}
          onClick={() => onToggleStar(card.id, card.progress.isStarred)}
        />
      ) : null}
    </article>
  )
})
