'use client'

import { useEffect, useRef } from 'react'
import { type MatchAttempt } from '@/entities/vocab'
import {
  MATCH_DELAY_MS,
  MATCH_WIN_DELAY_MS,
  WRONG_MATCH_DELAY_MS,
} from '../../shared/constants'
import { type ControllerStore } from '../../shared/controller-store'
import { GAME_STATUS } from './match-game-reducer'
import {
  type MatchGameStore,
  type PendingMatchPair,
} from './match-game.contract'

export function useMatchGameSync(
  store: ControllerStore<MatchGameStore>,
  { gameState, pairRetry }: MatchGameStore,
  onComplete: (durationMs?: number) => void,
  onPairAttempt: (attempt: MatchAttempt) => Promise<boolean>
) {
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (
      gameState.type !== GAME_STATUS.PLAYING ||
      gameState.selectedTileIds.length !== 2
    )
      return
    const timer = setTimeout(
      () => {
        const pending = store.getState().beginPair()

        if (!pending) return

        async function submit(attempt: PendingMatchPair) {
          try {
            const saved = await onPairAttempt(attempt.attempt)
            store.getState().finishPair(attempt, saved)
          } catch {
            store.getState().finishPair(attempt, false)
          }
        }
        void submit(pending)
      },
      gameState.wrongMatchIds.length > 0 ? WRONG_MATCH_DELAY_MS : MATCH_DELAY_MS
    )

    return () => clearTimeout(timer)
  }, [gameState, onPairAttempt, pairRetry, store])

  useEffect(() => {
    if (gameState.type !== GAME_STATUS.PLAYING || !gameState.endTime) return
    const timer = setTimeout(() => {
      if (!store.getState().finishGame()) return
      const finished = store.getState().gameState
      onCompleteRef.current(
        finished.type === GAME_STATUS.FINISHED
          ? finished.finalDuration
          : undefined
      )
    }, MATCH_WIN_DELAY_MS)

    return () => clearTimeout(timer)
  }, [gameState, store])
}
