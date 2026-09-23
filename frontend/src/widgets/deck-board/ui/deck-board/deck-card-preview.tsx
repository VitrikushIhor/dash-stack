'use client'

import { type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Volume2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/core/button'
import { EmptyState } from '@/shared/ui/feedback'
import { type StudyCard } from '@/entities/vocab'
import { StarButton } from '@/features/study-vocab'

type DeckCardPreviewProps = {
  isStarPending?: boolean
  card: StudyCard | null
  cardCount: number
  currentIndex: number
  isAuthenticated: boolean
  isFlipped: boolean
  onFlip: () => void
  onMove: (direction: -1 | 1) => void
  onPronounce: (text: string) => void
  onToggleStar: (cardId: string, isStarred: boolean) => void
}

const PreviewFaceSide = {
  FRONT: 'front',
  BACK: 'back',
} as const
type PreviewFaceSide = (typeof PreviewFaceSide)[keyof typeof PreviewFaceSide]

type PreviewFaceProps = {
  children: ReactNode
  isHidden: boolean
  label: string
  side: PreviewFaceSide
}

function PreviewFace({ children, isHidden, label, side }: PreviewFaceProps) {
  return (
    <span
      aria-hidden={isHidden}
      className={cn(
        'bg-muted/40 absolute inset-0 flex flex-col items-center justify-center rounded-xl border p-8 backface-hidden',
        side === PreviewFaceSide.BACK && 'transform-[rotateY(180deg)]'
      )}
    >
      <span className='text-muted-foreground absolute top-5 left-5 text-xs font-medium tracking-wider uppercase'>
        {label}
      </span>
      {children}
      <span className='text-muted-foreground absolute bottom-5 text-xs'>
        Click to flip
      </span>
    </span>
  )
}

export function DeckCardPreview({
  card,
  cardCount,
  currentIndex,
  isAuthenticated,
  isFlipped,
  onFlip,
  onMove,
  onPronounce,
  onToggleStar,
  isStarPending = false,
}: DeckCardPreviewProps) {
  return (
    <div className='bg-card rounded-2xl border p-4 shadow-sm sm:p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium'>Card preview</p>
          <p className='text-muted-foreground text-xs'>
            Previewing does not change your progress
          </p>
        </div>
        <span className='text-muted-foreground text-sm'>
          {card ? currentIndex + 1 : 0} / {cardCount}
        </span>
      </div>
      {card ? (
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
            <PreviewFace
              label='Term'
              side={PreviewFaceSide.FRONT}
              isHidden={isFlipped}
            >
              <span className='max-w-2xl text-2xl font-semibold sm:text-4xl'>
                {card.term}
              </span>
            </PreviewFace>
            <PreviewFace
              label='Definition'
              side={PreviewFaceSide.BACK}
              isHidden={!isFlipped}
            >
              <span className='max-w-2xl text-2xl font-semibold sm:text-4xl'>
                {card.definition}
              </span>
              {card.example ? (
                <span className='text-muted-foreground mt-6 max-w-xl text-sm italic'>
                  {card.example}
                </span>
              ) : null}
            </PreviewFace>
          </span>
        </button>
      ) : (
        <EmptyState title='This deck has no cards yet.' className='min-h-80' />
      )}
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
          {card ? (
            <Button
              variant='ghost'
              size='icon'
              onClick={() => onPronounce(card.term)}
              aria-label='Pronounce term'
            >
              <Volume2 />
            </Button>
          ) : null}
          {isAuthenticated && card ? (
            <StarButton
              isPending={isStarPending}
              disabled={isStarPending}
              isStarred={card.progress.isStarred}
              onClick={() => onToggleStar(card.id, card.progress.isStarred)}
            />
          ) : null}
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
    </div>
  )
}
