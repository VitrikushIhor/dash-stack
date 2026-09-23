'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { WidgetErrorState } from '@/shared/ui/feedback'
import { type MatchAttempt, type MatchCard } from '@/entities/vocab'
import { GAME_STATUS } from '../../model/match/game/match-game-reducer'
import { useMatch } from '../../model/match/game/use-match'
import { StudyEmptyState } from '../shared/study-empty-state'
import { StudySavingState } from '../shared/study-saving-state'
import { MatchTileButton } from './match-tile-button'
import { MatchTimer } from './match-timer'

interface MatchPlayerProps {
  cards: MatchCard[]
  onComplete: (durationMs?: number) => void
  onPairMatched: (attempt: MatchAttempt) => Promise<boolean>
}

export function MatchPlayer({
  cards,
  onComplete,
  onPairMatched,
}: MatchPlayerProps) {
  const { gameState, handleTileClick, pairError, retryPair } = useMatch(
    cards,
    onComplete,
    onPairMatched
  )

  if (cards.length < 6) {
    return (
      <StudyEmptyState
        title='Not Enough Cards'
        description='Match game requires at least 6 cards in the deck to play. Please add more cards to this deck and try again.'
      />
    )
  }

  if (
    gameState.type === GAME_STATUS.FINISHED ||
    (gameState.type === GAME_STATUS.PLAYING && gameState.endTime)
  ) {
    return (
      <StudySavingState
        title='Saving Result...'
        description='Processing your match game score.'
      />
    )
  }

  return (
    <div className='mx-auto flex min-h-150 w-full max-w-5xl flex-col px-4 py-8'>
      <div className='mb-8 flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Match Game</h2>
        <MatchTimer gameState={gameState} />
      </div>

      <AnimatePresence>
        {gameState.type === GAME_STATUS.PLAYING && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='grid flex-1 grid-cols-2 content-start gap-4 md:grid-cols-3 lg:grid-cols-4'
          >
            {gameState.tiles.map((tile) => (
              <MatchTileButton
                key={tile.id}
                tile={tile}
                isSelected={gameState.selectedTileIds.includes(tile.id)}
                isWrong={gameState.wrongMatchIds.includes(tile.id)}
                onClick={() => handleTileClick(tile.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {pairError && (
        <WidgetErrorState
          className='mt-4'
          title='Match pair could not be saved'
          description='Try saving this pair again.'
          onRetry={retryPair}
        />
      )}
    </div>
  )
}
