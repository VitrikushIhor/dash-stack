import { type MatchCard, MatchTileSide } from '@/entities/vocab'
import { createControllerStore } from '../../shared/controller-store'
import { createSessionLifecycle } from '../../shared/session-lifecycle'
import {
  GAME_STATUS,
  MATCH_ACTIONS,
  createInitialTiles,
  gameReducer,
} from './match-game-reducer'
import { type MatchGameStore } from './match-game.contract'

export function createMatchGameStore(cards: MatchCard[]) {
  const lifecycle = createSessionLifecycle()
  let pendingAttempt: { key: string; id: string } | null = null
  let syncingLease: number | null = null

  return createControllerStore<MatchGameStore>((set, get) => ({
    gameState: {
      type: GAME_STATUS.PLAYING,
      tiles: createInitialTiles(cards),
      selectedTileIds: [],
      wrongMatchIds: [],
      startTime: Date.now(),
      penaltyTime: 0,
    },
    pairError: false,
    pairRetry: 0,
    activate: lifecycle.activate,
    deactivate: (lease) => {
      if (!lifecycle.isActive(lease)) return
      lifecycle.deactivate(lease)
      syncingLease = null
    },
    selectTile: (tileId) => {
      if (syncingLease !== null) return
      const state = get().gameState
      const next = gameReducer(state, {
        type: MATCH_ACTIONS.SELECT_TILE,
        payload: tileId,
      })

      if (next === state) return
      set({ gameState: next, pairError: false })
    },
    retryPair: () => {
      if (syncingLease === null) set({ pairRetry: get().pairRetry + 1 })
    },
    beginPair: () => {
      const state = get().gameState
      const lease = lifecycle.current()

      if (
        lease === null ||
        syncingLease !== null ||
        state.type !== GAME_STATUS.PLAYING ||
        state.selectedTileIds.length !== 2
      )
        return null
      const [firstId, secondId] = state.selectedTileIds
      const first = state.tiles.find((tile) => tile.id === firstId)
      const second = state.tiles.find((tile) => tile.id === secondId)

      if (!first || !second) return null
      const key = `${firstId}:${secondId}`

      if (pendingAttempt?.key !== key)
        pendingAttempt = { key, id: crypto.randomUUID() }
      syncingLease = lease

      return {
        lease,
        attempt: {
          attemptId: pendingAttempt.id,
          first: {
            cardId: first.cardId,
            side:
              first.type === 'term'
                ? MatchTileSide.TERM
                : MatchTileSide.DEFINITION,
          },
          second: {
            cardId: second.cardId,
            side:
              second.type === 'term'
                ? MatchTileSide.TERM
                : MatchTileSide.DEFINITION,
          },
        },
      }
    },
    finishPair: (pending, saved) => {
      if (
        !lifecycle.isActive(pending.lease) ||
        syncingLease !== pending.lease ||
        pendingAttempt?.id !== pending.attempt.attemptId
      )
        return
      syncingLease = null
      if (!saved) {
        set({ pairError: true })

        return
      }
      const state = get().gameState

      if (state.type !== GAME_STATUS.PLAYING) return
      const [id1, id2] = state.selectedTileIds
      pendingAttempt = null
      set({
        pairError: false,
        gameState: gameReducer(
          state,
          state.wrongMatchIds.length > 0
            ? { type: MATCH_ACTIONS.CLEAR_WRONG_MATCH }
            : { type: MATCH_ACTIONS.MATCH_SUCCESS, payload: { id1, id2 } }
        ),
      })
    },
    finishGame: () => {
      const state = get().gameState

      if (
        lifecycle.current() === null ||
        state.type !== GAME_STATUS.PLAYING ||
        !state.endTime
      )
        return false
      set({
        gameState: gameReducer(state, {
          type: MATCH_ACTIONS.FINISH_GAME,
          payload: {
            duration: state.endTime - state.startTime + state.penaltyTime,
          },
        }),
      })

      return true
    },
  }))
}
