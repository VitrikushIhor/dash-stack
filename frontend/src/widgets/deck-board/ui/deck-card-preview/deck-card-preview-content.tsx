import { cn } from '@/shared/lib'
import { EmptyState } from '@/shared/ui/feedback'
import { type StudyCard } from '@/entities/vocab'
import { DeckCardFace } from './deck-card-face'

type DeckCardPreviewContentProps = {
  card: StudyCard | null
  isFlipped: boolean
  onFlip: () => void
}

export const DeckCardPreviewContent = ({
  card,
  isFlipped,
  onFlip,
}: DeckCardPreviewContentProps) => {
  if (!card) {
    return (
      <EmptyState title='This deck has no cards yet.' className='min-h-80' />
    )
  }

  return (
    <button
      type='button'
      className='focus-visible:ring-ring relative min-h-80 w-full rounded-xl text-center outline-none perspective-distant focus-visible:ring-2'
      onClick={onFlip}
      aria-label='Preview card'
      aria-pressed={isFlipped}
    >
      <span
        data-testid='preview-card-inner'
        className={cn(
          'absolute inset-0 transform-3d motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out',
          isFlipped && 'transform-[rotateY(180deg)]'
        )}
      >
        <DeckCardFace label='Term' isHidden={isFlipped}>
          <span className='max-w-2xl text-2xl font-semibold sm:text-4xl'>
            {card.term}
          </span>
        </DeckCardFace>

        <DeckCardFace label='Definition' isBack isHidden={!isFlipped}>
          <span className='max-w-2xl text-2xl font-semibold sm:text-4xl'>
            {card.definition}
          </span>

          {card.example && (
            <span className='text-muted-foreground mt-6 max-w-xl text-sm italic'>
              {card.example}
            </span>
          )}
        </DeckCardFace>
      </span>
    </button>
  )
}
