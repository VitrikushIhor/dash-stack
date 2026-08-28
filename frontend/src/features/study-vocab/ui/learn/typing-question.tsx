'use client'

import React, { type FormEvent, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/shared/ui/core/button'
import { Input } from '@/shared/ui/core/input'
import { type StudyCard } from '@/entities/vocab'
import { isTermMatch } from '../../lib/is-term-match'
import { TYPING_FEEDBACK_DELAY_MS } from '../../model/shared/constants'
import { CardStarButton } from '../star-button/card-star-button'

interface TypingQuestionProps {
  card: StudyCard
  onAnswer: (isCorrect: boolean) => void
}

export function TypingQuestion({ card, onAnswer }: TypingQuestionProps) {
  const [inputValue, setInputValue] = useState('')
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null)
  const onAnswerRef = useRef(onAnswer)

  useEffect(() => {
    onAnswerRef.current = onAnswer
  }, [onAnswer])

  const isCorrect =
    submittedAnswer !== null ? isTermMatch(submittedAnswer, card.term) : false

  useEffect(() => {
    if (submittedAnswer !== null) {
      const timer = setTimeout(() => {
        onAnswerRef.current(isCorrect)
      }, TYPING_FEEDBACK_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [submittedAnswer, isCorrect])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (submittedAnswer !== null || !inputValue.trim()) return

    setSubmittedAnswer(inputValue)
  }

  return (
    <div className='mx-auto flex w-full max-w-2xl flex-col items-center'>
      <div className='bg-card border-border relative mb-8 w-full rounded-xl border p-8 shadow-sm'>
        <div className='absolute top-4 right-4'>
          <CardStarButton card={card} />
        </div>
        <h3 className='text-primary mb-4 text-xl font-semibold'>Definition</h3>
        <p className='text-lg leading-relaxed'>{card.definition}</p>

        {card.example && (
          <div className='border-border mt-4 border-t pt-4'>
            <h4 className='text-muted-foreground mb-1 text-sm font-semibold'>
              Example
            </h4>
            <p className='text-md text-muted-foreground italic'>
              {card.example}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className='relative w-full'>
        <Input
          type='text'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder='Type the term...'
          disabled={submittedAnswer !== null}
          className='h-16 rounded-xl px-6 pr-32 text-xl'
          autoFocus
        />
        <Button
          type='submit'
          disabled={submittedAnswer !== null || !inputValue.trim()}
          className='absolute top-2 right-2 h-12 rounded-lg px-6'
        >
          Check
        </Button>
      </form>

      <div className='mt-4 flex h-20 w-full items-center justify-center'>
        <AnimatePresence>
          {submittedAnswer !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`w-full rounded-xl p-4 text-center text-xl font-bold shadow-sm ${
                isCorrect
                  ? 'bg-emerald-600 text-white'
                  : 'border border-red-500/50 bg-red-500/15 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300'
              }`}
            >
              {isCorrect ? (
                'Correct!'
              ) : (
                <div className='flex flex-col items-center'>
                  <span>Incorrect</span>
                  <span className='text-muted-foreground mt-1 text-sm font-normal'>
                    The correct answer is:{' '}
                    <strong className='text-foreground font-semibold'>
                      {card.term}
                    </strong>
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
