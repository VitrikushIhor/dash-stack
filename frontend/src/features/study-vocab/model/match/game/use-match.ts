'use client'

import { useMemo } from 'react'
import { type MatchAttempt, type MatchCard } from '@/entities/vocab'
import { useSessionStore } from '../../shared/use-session-store'
import { useStudyControllerFactories } from '../../study-controllers-provider'
import { useMatchGameSync } from './use-match-game-sync'

export function useMatch(
  cards: MatchCard[],
  onComplete: (durationMs?: number) => void,
  onPairAttempt: (attempt: MatchAttempt) => Promise<boolean>
) {
  const { matchGame } = useStudyControllerFactories()
  const store = useMemo(() => matchGame(cards), [cards, matchGame])
  const state = useSessionStore(store)
  useMatchGameSync(store, state, onComplete, onPairAttempt)

  return {
    gameState: state.gameState,
    handleTileClick: state.selectTile,
    pairError: state.pairError,
    retryPair: state.retryPair,
  }
}
