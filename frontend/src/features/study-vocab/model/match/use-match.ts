'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import { type StudyCard } from '@/entities/vocab'
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
  cards: StudyCard[],
  onComplete: (durationMs: number) => void
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

  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // Handle wrong match timer or successful match timer when 2 tiles are selected
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
        dispatch({ type: MATCH_ACTIONS.MATCH_SUCCESS, payload: { id1, id2 } })
      }, MATCH_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [state])

  // Handle win completion
  useEffect(() => {
    if (state.type === GAME_STATUS.PLAYING && state.endTime) {
      const finalDuration = state.endTime - state.startTime + state.penaltyTime
      const timer = setTimeout(() => {
        dispatch({
          type: MATCH_ACTIONS.FINISH_GAME,
          payload: { duration: finalDuration },
        })
        onCompleteRef.current(finalDuration)
      }, MATCH_WIN_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [state])

  const handleTileClick = useCallback((tileId: string) => {
    dispatch({ type: MATCH_ACTIONS.SELECT_TILE, payload: tileId })
  }, [])

  return {
    gameState: state,
    handleTileClick,
  }
}
