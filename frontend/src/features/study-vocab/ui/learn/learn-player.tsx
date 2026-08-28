'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { type StudyCard } from '@/entities/vocab'
import {
  type LearnQuestionType,
  QUESTION_TYPES,
} from '../../model/shared/constants'
import { type LearnResult } from '../../model/shared/types'
import { useCardProgression } from '../../model/shared/use-card-progression'
import { StudyEmptyState } from '../shared/study-empty-state'
import { StudySavingState } from '../shared/study-saving-state'
import { StudySessionView } from '../shared/study-session-view'
import { MultipleChoiceQuestion } from './multiple-choice-question'
import { TypingQuestion } from './typing-question'

interface LearnPlayerProps {
  cards: StudyCard[]
  mode: LearnQuestionType
  onComplete: (results: LearnResult[]) => void
}

export function LearnPlayer({ cards, mode, onComplete }: LearnPlayerProps) {
  const {
    currentCard,
    progress,
    handleAnswer,
    isFinished,
    currentIndex,
    allCards,
  } = useCardProgression(cards, onComplete)

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
          Card {currentIndex + 1} of {allCards.length}
        </span>
        {mode === QUESTION_TYPES.MCQ && (
          <span className='text-muted-foreground hidden text-xs sm:inline'>
            Shortcuts: 1 - 4 (select answer)
          </span>
        )}
      </StudySessionView.Header>

      <StudySessionView.Content>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className='w-full'
          >
            {mode === QUESTION_TYPES.MCQ ? (
              <MultipleChoiceQuestion
                key={currentCard.id}
                card={currentCard}
                allCards={allCards}
                onAnswer={handleAnswer}
              />
            ) : (
              <TypingQuestion
                key={currentCard.id}
                card={currentCard}
                onAnswer={handleAnswer}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </StudySessionView.Content>
    </StudySessionView>
  )
}
