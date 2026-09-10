'use client'

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { type MatchCard } from '@/entities/vocab'
import {
  MATCH_DELAY_MS,
  MATCH_WIN_DELAY_MS,
  WRONG_MATCH_DELAY_MS,
} from '../shared/constants'
import {
  GAME_STATUS,
  type GameState,
  MATCH_ACTIONS,
  createInitialTiles,
  gameReducer,
} from './match-game-reducer'

export function useMatch(
  cards: MatchCard[],
  onComplete: () => void,
  onPairMatched: (cardId: string) => Promise<boolean>
) {
  const [state, dispatch] = useReducer(
    gameReducer,
    cards,
    (initialCards): GameState => ({
      type: GAME_STATUS.PLAYING,
      tiles: createInitialTiles(initialCards),
      selectedTileIds: [],
      wrongMatchIds: [],
      startTime: Date.now(),
      penaltyTime: 0,
    })
  )
  const [pairError, setPairError] = useState(false)
  const [pairRetry, setPairRetry] = useState(0)

  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (state.type !== GAME_STATUS.PLAYING) return

    if (state.selectedTileIds.length === 2 && state.wrongMatchIds.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: MATCH_ACTIONS.CLEAR_WRONG_MATCH })
      }, WRONG_MATCH_DELAY_MS)
      return () => clearTimeout(timer)
    }

    if (
      state.selectedTileIds.length === 2 &&
      state.wrongMatchIds.length === 0
    ) {
      const [id1, id2] = state.selectedTileIds
      const timer = setTimeout(() => {
        const cardId = state.tiles.find((tile) => tile.id === id1)?.cardId
        if (cardId)
          void onPairMatched(cardId).then((saved) => {
            if (saved) {
              setPairError(false)
              dispatch({
                type: MATCH_ACTIONS.MATCH_SUCCESS,
                payload: { id1, id2 },
              })
            } else setPairError(true)
          })
      }, MATCH_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [onPairMatched, pairRetry, state])

  // Handle win completion
  useEffect(() => {
    if (state.type === GAME_STATUS.PLAYING && state.endTime) {
      const finalDuration = state.endTime - state.startTime + state.penaltyTime
      const timer = setTimeout(() => {
        dispatch({
          type: MATCH_ACTIONS.FINISH_GAME,
          payload: { duration: finalDuration },
        })
        onCompleteRef.current()
      }, MATCH_WIN_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [state])

  const handleTileClick = useCallback(
    (tileId: string) => {
      if (
        state.type === GAME_STATUS.PLAYING &&
        state.selectedTileIds.includes(tileId)
      ) {
        setPairError(false)
      }
      dispatch({ type: MATCH_ACTIONS.SELECT_TILE, payload: tileId })
    },
    [state]
  )

  return {
    gameState: state,
    handleTileClick,
    pairError,
    retryPair: () => setPairRetry((value) => value + 1),
  }
}
