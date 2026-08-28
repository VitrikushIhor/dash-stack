'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { useSpeech } from '@/shared/lib/hooks/use-speech'
import { Button } from '@/shared/ui/core/button'
import { type StudyCard } from '@/entities/vocab'
import { CardStarButton } from '../star-button/card-star-button'

interface FlashcardItemProps {
  card: StudyCard
  isFlipped: boolean
  onFlip: () => void
}

export function FlashcardItem({ card, isFlipped, onFlip }: FlashcardItemProps) {
  const { speak } = useSpeech({ lang: 'en-US' })

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    speak(card.term)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      if ((e.target as HTMLElement).tagName === 'BUTTON') return
      onFlip()
    }
  }

  return (
    <div
      className='perspective-1000 relative mx-auto aspect-3/2 w-full max-w-2xl cursor-pointer'
      onClick={onFlip}
      role='button'
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label='Flashcard'
    >
      <motion.div
        className='preserve-3d relative h-full w-full'
        initial={false}
        animate={{ rotateX: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
      >
        {/* Front */}
        <div className='bg-card text-card-foreground border-border absolute flex h-full w-full flex-col items-center justify-center rounded-2xl border p-8 shadow-lg backface-hidden'>
          <div className='absolute top-4 right-4 flex items-center gap-1'>
            <CardStarButton card={card} />
            <Button
              variant='ghost'
              size='icon'
              className='text-muted-foreground hover:text-foreground'
              onClick={playAudio}
              onMouseDown={(e) => e.preventDefault()}
              aria-label='Pronounce term'
            >
              <Volume2 className='h-5 w-5' />
            </Button>
          </div>
          <h2 className='mb-4 text-center text-4xl font-bold sm:text-5xl'>
            {card.term}
          </h2>
          <p className='text-muted-foreground absolute bottom-6 text-sm'>
            Click or press Space to flip
          </p>
        </div>

        {/* Back */}
        <div
          className='bg-card text-card-foreground border-border absolute flex h-full w-full flex-col overflow-y-auto rounded-2xl border p-8 shadow-lg backface-hidden'
          style={{ transform: 'rotateX(180deg)' }}
        >
          <div className='flex flex-1 flex-col'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-primary text-xl font-semibold'>Definition</h3>
              <CardStarButton card={card} />
            </div>
            <p className='mb-6 flex-1 text-lg leading-relaxed sm:text-xl'>
              {card.definition}
            </p>

            {card.example && (
              <div className='mt-auto'>
                <h4 className='text-muted-foreground mb-2 text-sm font-semibold'>
                  Example
                </h4>
                <p className='text-md border-primary/50 border-l-2 pl-4 italic'>
                  {card.example}
                </p>
              </div>
            )}
          </div>

          {card.imageUrl && (
            <div className='relative mt-6 h-32 w-full shrink-0 overflow-hidden rounded-lg'>
              <Image
                src={card.imageUrl}
                alt='Illustrative image for term'
                fill
                className='object-cover'
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
