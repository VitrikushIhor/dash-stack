'use client'

import React, { useEffect, useState } from 'react'
import { formatTime } from '@/shared/lib/utils'
import {
  GAME_STATUS,
  type GameState,
} from '../../model/match/game/match-game-reducer'

export const MatchTimer = React.memo(function MatchTimer({
  gameState,
}: {
  gameState: GameState
}) {
  const [elapsedMs, setElapsedMs] = useState(0)

  const { type } = gameState
  const startTime = type === GAME_STATUS.PLAYING ? gameState.startTime : 0
  const penaltyTime = type === GAME_STATUS.PLAYING ? gameState.penaltyTime : 0
  const endTime = type === GAME_STATUS.PLAYING ? gameState.endTime : undefined

  useEffect(() => {
    if (type === GAME_STATUS.FINISHED || endTime) return

    const timer = setInterval(() => {
      setElapsedMs(Math.max(0, Date.now() - startTime + penaltyTime))
    }, 50)

    return () => clearInterval(timer)
  }, [type, startTime, penaltyTime, endTime])

  const displayTime = getDisplayTime(gameState, elapsedMs)

  return (
    <div className='bg-card rounded-lg border px-4 py-2 font-mono text-2xl shadow-sm'>
      {formatTime(displayTime)}
    </div>
  )
})

function getDisplayTime(gameState: GameState, elapsedMs: number): number {
  if (gameState.type === GAME_STATUS.FINISHED) return gameState.finalDuration
  if (gameState.endTime)
    return gameState.endTime - gameState.startTime + gameState.penaltyTime

  return elapsedMs
}
