'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/utils'
import {
  type MatchTile,
  TILE_TYPES,
} from '../../model/match/match-game-reducer'

interface MatchTileButtonProps {
  tile: MatchTile
  isSelected: boolean
  isWrong: boolean
  onClick: () => void
}

export const MatchTileButton = React.memo(function MatchTileButton({
  tile,
  isSelected,
  isWrong,
  onClick,
}: MatchTileButtonProps) {
  if (tile.isMatched) {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.8 }}
        className='pointer-events-none invisible min-h-30'
      />
    )
  }

  const isTerm = tile.type === TILE_TYPES.TERM

  return (
    <motion.button
      type='button'
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex h-full min-h-30 w-full cursor-pointer items-center justify-center rounded-xl border p-4 text-center shadow-sm transition-colors outline-none select-none',
        isTerm
          ? 'bg-card text-2xl font-bold'
          : 'bg-card/50 text-base leading-relaxed',
        isSelected &&
          !isWrong &&
          'border-primary bg-primary/10 ring-primary ring-offset-background ring-2 ring-offset-2',
        isWrong &&
          'ring-offset-background border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500 ring-offset-2 dark:bg-red-950/30 dark:text-red-400',
        !isSelected && !isWrong && 'hover:border-primary/50 hover:bg-accent'
      )}
      animate={isWrong ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={isWrong ? { duration: 0.4 } : undefined}
    >
      <span className='line-clamp-4'>{tile.text}</span>
    </motion.button>
  )
})
