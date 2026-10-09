import { ArrowLeft, ArrowRight, Volume2 } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import { type StudyCard } from '@/entities/vocab'
import { StarButton } from '@/features/study-vocab'

type DeckCardPreviewControlsProps = {
  card: StudyCard | null
  isAuthenticated: boolean
  isStarPending: boolean
  onMove: (direction: -1 | 1) => void
  onPronounce: (text: string) => void
  onToggleStar: (cardId: string, isStarred: boolean) => void
}

export const DeckCardPreviewControls = ({
  card,
  isAuthenticated,
  isStarPending,
  onMove,
  onPronounce,
  onToggleStar,
}: DeckCardPreviewControlsProps) => {
  return (
    <div className='mt-4 flex items-center justify-between'>
      <Button
        variant='outline'
        size='icon'
        onClick={() => onMove(-1)}
        disabled={!card}
        aria-label='Previous card'
      >
        <ArrowLeft />
      </Button>

      <div className='flex gap-1'>
        {card && (
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onPronounce(card.term)}
            aria-label='Pronounce term'
          >
            <Volume2 />
          </Button>
        )}

        {card && isAuthenticated && (
          <StarButton
            isPending={isStarPending}
            disabled={isStarPending}
            isStarred={card.progress.isStarred}
            onClick={() => onToggleStar(card.id, card.progress.isStarred)}
          />
        )}
      </div>

      <Button
        variant='outline'
        size='icon'
        onClick={() => onMove(1)}
        disabled={!card}
        aria-label='Next card'
      >
        <ArrowRight />
      </Button>
    </div>
  )
}
