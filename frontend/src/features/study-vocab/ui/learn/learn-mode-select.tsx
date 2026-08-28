'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Keyboard,
  ListChecks,
  Sparkles,
} from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/core/badge'
import { Button } from '@/shared/ui/core/button'
import { type Deck } from '@/entities/deck'
import {
  type LearnQuestionType,
  QUESTION_TYPES,
} from '../../model/shared/constants'

interface LearnModeSelectProps {
  deck: Deck
  cardsCount: number
  onSelectMode: (mode: LearnQuestionType) => void
}

export function LearnModeSelect({
  deck,
  cardsCount,
  onSelectMode,
}: LearnModeSelectProps) {
  const isMcqDisabled = cardsCount < 4
  const [selectedMode, setSelectedMode] = useState<LearnQuestionType>(
    isMcqDisabled ? QUESTION_TYPES.TYPING : QUESTION_TYPES.MCQ
  )

  const modes = [
    {
      id: QUESTION_TYPES.MCQ,
      title: 'Multiple Choice',
      subtitle: 'Fast recognition',
      description:
        'Choose the correct definition from 4 options. Great for learning new words quickly.',
      icon: ListChecks,
      badge: 'Recognition',
      disabled: isMcqDisabled,
      disabledReason: 'Requires at least 4 cards in the deck',
      accentColor:
        'text-blue-500 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
      activeRing: 'ring-blue-500/50 border-blue-500',
    },
    {
      id: QUESTION_TYPES.TYPING,
      title: 'Typing Recall',
      subtitle: 'Active recall',
      description:
        'Type the exact term for each definition from memory. Best for deep retention and spelling.',
      icon: Keyboard,
      badge: 'Active Recall',
      disabled: false,
      disabledReason: null,
      accentColor:
        'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      activeRing: 'ring-emerald-500/50 border-emerald-500',
    },
  ]

  const handleStart = () => {
    onSelectMode(selectedMode)
  }

  return (
    <div className='mx-auto flex min-h-150 w-full max-w-3xl flex-col justify-center px-4 py-8'>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='flex flex-col items-center text-center'
      >
        <div className='border-primary/20 bg-primary/5 text-primary mb-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium'>
          <Sparkles className='h-3.5 w-3.5' />
          <span>Learn Mode</span>
        </div>

        <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
          Choose How You Want to Learn
        </h1>
        <p className='text-muted-foreground mt-2 max-w-lg text-sm sm:text-base'>
          Select a practice mode for{' '}
          <span className='text-foreground font-semibold'>{deck.title}</span> (
          {cardsCount} {cardsCount === 1 ? 'card' : 'cards'})
        </p>

        <div className='mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2'>
          {modes.map((mode) => {
            const isSelected = selectedMode === mode.id && !mode.disabled
            const Icon = mode.icon

            return (
              <motion.button
                key={mode.id}
                type='button'
                whileHover={mode.disabled ? {} : { scale: 1.02 }}
                whileTap={mode.disabled ? {} : { scale: 0.98 }}
                onClick={() => {
                  if (!mode.disabled) {
                    setSelectedMode(mode.id)
                  }
                }}
                disabled={mode.disabled}
                className={cn(
                  'group relative flex flex-col items-start rounded-2xl border p-6 text-left transition-all',
                  isSelected
                    ? cn('bg-card shadow-md ring-2', mode.activeRing)
                    : 'border-border bg-card/60 hover:border-border/80 hover:bg-card hover:shadow-sm',
                  mode.disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                <div className='flex w-full items-center justify-between'>
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl border',
                      mode.accentColor
                    )}
                  >
                    <Icon className='h-6 w-6' />
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant='secondary' className='text-xs'>
                      {mode.badge}
                    </Badge>
                    {isSelected && (
                      <CheckCircle2 className='text-primary h-5 w-5' />
                    )}
                  </div>
                </div>

                <div className='mt-5'>
                  <h3 className='text-foreground text-lg font-semibold'>
                    {mode.title}
                  </h3>
                  <p className='text-muted-foreground mt-1.5 text-xs leading-relaxed sm:text-sm'>
                    {mode.description}
                  </p>
                </div>

                {mode.disabled && mode.disabledReason && (
                  <p className='text-destructive mt-3 text-xs font-medium'>
                    {mode.disabledReason}
                  </p>
                )}
              </motion.button>
            )
          })}
        </div>

        <div className='mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row'>
          <Button variant='outline' asChild className='flex-1 gap-2'>
            <Link href={ROUTES.vocabDecks}>
              <ArrowLeft className='h-4 w-4' />
              <span>Back to Decks</span>
            </Link>
          </Button>

          <Button
            onClick={handleStart}
            size='lg'
            className='flex-1 gap-2 text-base font-semibold shadow-sm'
          >
            <span>Start Session</span>
            <ArrowRight className='h-4 w-4' />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
