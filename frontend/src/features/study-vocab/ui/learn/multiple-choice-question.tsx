'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { useSpeech } from '@/shared/lib/hooks/use-speech'
import { cn, shuffle } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/core/button'
import { type StudyCard } from '@/entities/vocab'
import { getOptionStyles } from '../../lib/get-option-styles'
import { useMultipleChoiceShortcuts } from '../../model/learn/interaction/use-multiple-choice-shortcuts'
import { ANSWER_FEEDBACK_DELAY_MS } from '../../model/shared/constants'
import { CardStarButton } from '../star-button/card-star-button'

interface MultipleChoiceQuestionProps {
  card: StudyCard
  allCards: StudyCard[]
  onAnswer: (isCorrect: boolean) => void
}

export function MultipleChoiceQuestion({
  card,
  allCards,
  onAnswer,
}: MultipleChoiceQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const { speak } = useSpeech({ lang: 'en-US' })

  const options = useMemo(() => {
    const distractors = allCards.filter(
      (c) => c.id !== card.id && c.definition !== card.definition
    )
    const shuffledDistractors = shuffle(distractors).slice(0, 3)
    const combined = [card, ...shuffledDistractors]
    return shuffle(combined)
  }, [card, allCards])

  const onAnswerRef = useRef(onAnswer)
  useEffect(() => {
    onAnswerRef.current = onAnswer
  }, [onAnswer])

  useEffect(() => {
    if (selectedAnswer) {
      const isCorrect = selectedAnswer === card.id
      const timer = setTimeout(() => {
        onAnswerRef.current(isCorrect)
      }, ANSWER_FEEDBACK_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [selectedAnswer, card.id])

  const handleSelect = useCallback(
    (selectedCardId: string) => {
      if (selectedAnswer) return
      setSelectedAnswer(selectedCardId)
    },
    [selectedAnswer]
  )

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    speak(card.term)
  }

  useMultipleChoiceShortcuts({
    optionsCount: options.length,
    isDisabled: !!selectedAnswer,
    onSelectIndex: (index) => {
      const targetOption = options[index]
      if (targetOption) {
        handleSelect(targetOption.id)
      }
    },
  })

  return (
    <div className='mx-auto flex w-full max-w-2xl flex-col items-center'>
      <div className='bg-card border-border relative mb-8 w-full rounded-xl border p-8 text-center shadow-sm'>
        <div className='absolute top-4 right-4 flex items-center gap-1'>
          <CardStarButton card={card} />
          <Button
            variant='ghost'
            size='icon'
            className='text-muted-foreground hover:text-foreground'
            onClick={handlePlayAudio}
            onMouseDown={(e) => e.preventDefault()}
            aria-label='Pronounce term'
          >
            <Volume2 className='h-5 w-5' />
          </Button>
        </div>
        <h2 className='text-3xl font-bold'>{card.term}</h2>
      </div>

      <div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2'>
        {options.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className='flex h-full w-full'
          >
            <button
              type='button'
              className={cn(
                'focus-visible:ring-ring flex h-full min-h-25 w-full cursor-pointer items-center justify-start rounded-xl border p-5 text-left text-base font-medium whitespace-normal transition-colors duration-150 outline-none focus-visible:ring-2 disabled:cursor-default sm:text-lg',
                getOptionStyles(option.id, card.id, selectedAnswer)
              )}
              onClick={() => handleSelect(option.id)}
              disabled={!!selectedAnswer}
            >
              <span className='w-full leading-snug'>{option.definition}</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
