'use client'

import React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Shuffle } from 'lucide-react'
import { useSpeech } from '@/shared/lib/hooks/use-speech'
import { Button } from '@/shared/ui/core/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/core/tooltip'
import { type StudyCard } from '@/entities/vocab'
import { useStarCard } from '@/features/study-vocab/model/shared/use-star-card'
import { useFlashcards } from '../../model/flashcards/game/use-flashcards'
import { useFlashcardShortcuts } from '../../model/flashcards/use-flashcard-shortcuts'
import { StudyEmptyState } from '../shared/study-empty-state'
import { StudySavingState } from '../shared/study-saving-state'
import { StudySessionView } from '../shared/study-session-view'
import { FlashcardItem } from './flashcard-item'

interface FlashcardPlayerProps {
  cards: StudyCard[]
  onComplete: (results: { flashcardId: string; isCorrect: boolean }[]) => void
}

export function FlashcardPlayer({ cards, onComplete }: FlashcardPlayerProps) {
  const shouldReduceMotion = useReducedMotion()
  const {
    currentCard,
    isFlipped,
    progress,
    results,
    flipCard,
    handleAnswer,
    isFinished,
    totalCards: sessionTotalCards,
    currentIndex,
    goToNextCard,
    goToPreviousCard,
    shuffleCards,
  } = useFlashcards(cards, onComplete)
  const { speak } = useSpeech({ lang: 'en-US' })

  const {
    isStarred,
    toggleStar,
    isPending: isStarPending,
    isDisabled: isStarDisabled,
  } = useStarCard(
    currentCard?.deckId ?? '',
    currentCard?.id ?? '',
    currentCard?.progress.isStarred ?? false
  )

  const handleReplayPronunciation = () => {
    if (!currentCard) return
    speak(currentCard.term)
  }

  useFlashcardShortcuts({
    isFinished,
    isFlipped,
    onFlip: flipCard,
    onAnswer: handleAnswer,
    onPrevious: goToPreviousCard,
    onNext: goToNextCard,
    onStar: toggleStar,
    onReplay: handleReplayPronunciation,
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
      <p className='text-muted-foreground text-sm' aria-live='polite'>
        Answered {results.length} of {sessionTotalCards}
      </p>

      <StudySessionView.Header>
        <span>
          Card {currentIndex + 1} of {sessionTotalCards}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              onClick={(event) => {
                shuffleCards()
                event.currentTarget.blur()
              }}
              aria-label='Shuffle flashcards'
            >
              <Shuffle className='h-4 w-4' />
              Shuffle
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Changes the card order while keeping your answers.
          </TooltipContent>
        </Tooltip>
        <span className='hidden sm:inline'>
          Shortcuts: ←/→ (navigate), Space (flip), ↑ (star), ⌘/Ctrl+J (audio)
        </span>
      </StudySessionView.Header>

      <StudySessionView.Content>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className='w-full'
          >
            <FlashcardItem
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={flipCard}
              isStarred={isStarred}
              isStarPending={isStarPending}
              isStarDisabled={isStarDisabled}
              onToggleStar={toggleStar}
              onReplay={handleReplayPronunciation}
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
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
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
