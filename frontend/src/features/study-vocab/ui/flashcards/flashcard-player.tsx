'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/shared/ui/core/button'
import { type StudyCard } from '@/entities/vocab'
import { useFlashcardShortcuts } from '../../model/flashcards/use-flashcard-shortcuts'
import { useFlashcards } from '../../model/flashcards/use-flashcards'
import { StudyEmptyState } from '../shared/study-empty-state'
import { StudySavingState } from '../shared/study-saving-state'
import { StudySessionView } from '../shared/study-session-view'
import { FlashcardItem } from './flashcard-item'

interface FlashcardPlayerProps {
  cards: StudyCard[]
  onComplete: (results: { flashcardId: string; isCorrect: boolean }[]) => void
}

export function FlashcardPlayer({ cards, onComplete }: FlashcardPlayerProps) {
  const {
    currentCard,
    isFlipped,
    progress,
    flipCard,
    handleAnswer,
    isFinished,
    totalCards: sessionTotalCards,
    currentIndex,
  } = useFlashcards(cards, onComplete)

  useFlashcardShortcuts({
    isFinished,
    isFlipped,
    onFlip: flipCard,
    onAnswer: handleAnswer,
  })

  if (!cards.length) {
    return <StudyEmptyState />
  }

  if (isFinished || !currentCard) {
    return <StudySavingState />
  }

  return (
    <StudySessionView>
      <StudySessionView.Progress progress={progress} />

      <StudySessionView.Header>
        <span>
          Card {currentIndex + 1} of {sessionTotalCards}
        </span>
        <span className='hidden sm:inline'>
          Shortcuts: Space (flip), 1 (don&apos;t know), 2 (know)
        </span>
      </StudySessionView.Header>

      <StudySessionView.Content>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className='w-full'
          >
            <FlashcardItem
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={flipCard}
            />
          </motion.div>
        </AnimatePresence>
      </StudySessionView.Content>

      <StudySessionView.Footer>
        {isFlipped ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='flex w-full max-w-md gap-4'
            >
              <Button
                variant='destructive'
                size='lg'
                className='flex-1 text-lg font-medium'
                onClick={() => handleAnswer(false)}
                aria-keyshortcuts='1'
              >
                Don&apos;t Know (1)
              </Button>
              <Button
                variant='default'
                size='lg'
                className='flex-1 bg-green-600 text-lg font-medium text-white hover:bg-green-700'
                onClick={() => handleAnswer(true)}
                aria-keyshortcuts='2'
              >
                Know (2)
              </Button>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className='w-full max-w-md' />
        )}
      </StudySessionView.Footer>
    </StudySessionView>
  )
}
