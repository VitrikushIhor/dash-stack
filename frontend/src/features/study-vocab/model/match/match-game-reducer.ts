import { shuffle } from '@/shared/lib/utils'
import { type StudyCard } from '@/entities/vocab'
import {
  MAX_MATCH_CARDS,
  MIN_MATCH_CARDS,
  PENALTY_TIME_MS,
} from '../shared/constants'

export const TILE_TYPES = {
  TERM: 'term',
  DEFINITION: 'definition',
} as const

export const GAME_STATUS = {
  PLAYING: 'playing',
  FINISHED: 'finished',
} as const

export const MATCH_ACTIONS = {
  SELECT_TILE: 'SELECT_TILE',
  MATCH_SUCCESS: 'MATCH_SUCCESS',
  MATCH_FAIL: 'MATCH_FAIL',
  CLEAR_WRONG_MATCH: 'CLEAR_WRONG_MATCH',
  FINISH_GAME: 'FINISH_GAME',
} as const

export type MatchTile = {
  id: string
  cardId: string
  type: (typeof TILE_TYPES)[keyof typeof TILE_TYPES]
  text: string
  isMatched: boolean
}

export type GamePlaying = {
  type: typeof GAME_STATUS.PLAYING
  tiles: MatchTile[]
  selectedTileIds: string[]
  wrongMatchIds: string[]
  startTime: number
  penaltyTime: number
  endTime?: number
}

export type GameFinished = {
  type: typeof GAME_STATUS.FINISHED
  tiles: MatchTile[]
  finalDuration: number
}

export type GameState = GamePlaying | GameFinished

export type GameAction =
  | { type: typeof MATCH_ACTIONS.SELECT_TILE; payload: string }
  | {
      type: typeof MATCH_ACTIONS.MATCH_SUCCESS
      payload: { id1: string; id2: string }
    }
  | {
      type: typeof MATCH_ACTIONS.MATCH_FAIL
      payload: { id1: string; id2: string }
    }
  | { type: typeof MATCH_ACTIONS.CLEAR_WRONG_MATCH }
  | { type: typeof MATCH_ACTIONS.FINISH_GAME; payload: { duration: number } }

export function createInitialTiles(cards: StudyCard[]): MatchTile[] {
  if (cards.length < MIN_MATCH_CARDS) {
    throw new Error(`Match game requires at least ${MIN_MATCH_CARDS} cards`)
  }
  const sessionCards = shuffle([...cards]).slice(0, MAX_MATCH_CARDS)
  const tiles: MatchTile[] = []
  sessionCards.forEach((card) => {
    tiles.push({
      id: `term-${card.id}`,
      cardId: card.id,
      type: TILE_TYPES.TERM,
      text: card.term,
      isMatched: false,
    })
    tiles.push({
      id: `def-${card.id}`,
      cardId: card.id,
      type: TILE_TYPES.DEFINITION,
      text: card.definition,
      isMatched: false,
    })
  })
  return shuffle(tiles)
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.type === GAME_STATUS.FINISHED) {
    return state
  }

  switch (action.type) {
    case MATCH_ACTIONS.SELECT_TILE: {
      if (state.wrongMatchIds.length > 0) return state
      if (state.selectedTileIds.includes(action.payload)) return state
      if (state.selectedTileIds.length >= 2) return state

      const clickedTile = state.tiles.find((t) => t.id === action.payload)
      if (!clickedTile || clickedTile.isMatched) return state

      if (state.selectedTileIds.length === 0) {
        return {
          ...state,
          selectedTileIds: [action.payload],
        }
      }

      const id1 = state.selectedTileIds[0]
      const id2 = action.payload
      const t1 = state.tiles.find((t) => t.id === id1)
      const t2 = clickedTile

      const isMatch = Boolean(
        t1 && t2 && t1.cardId === t2.cardId && t1.type !== t2.type
      )

      if (isMatch) {
        return {
          ...state,
          selectedTileIds: [id1, id2],
          wrongMatchIds: [],
        }
      }

      return {
        ...state,
        selectedTileIds: [id1, id2],
        wrongMatchIds: [id1, id2],
      }
    }
    case MATCH_ACTIONS.MATCH_SUCCESS: {
      const { id1, id2 } = action.payload

      const t1 = state.tiles.find((t) => t.id === id1)
      const t2 = state.tiles.find((t) => t.id === id2)

      // Guard: both tiles exist and are valid
      if (!t1 || !t2) return state
      if (t1.isMatched || t2.isMatched) return state
      if (t1.id === t2.id) return state
      if (t1.cardId !== t2.cardId || t1.type === t2.type) return state

      const newTiles = state.tiles.map((t) =>
        t.id === id1 || t.id === id2 ? { ...t, isMatched: true } : t
      )

      const isWin = newTiles.every((t) => t.isMatched)

      return {
        ...state,
        tiles: newTiles,
        selectedTileIds: [],
        wrongMatchIds: [],
        ...(isWin ? { endTime: Date.now() } : {}),
      }
    }
    case MATCH_ACTIONS.MATCH_FAIL: {
      const { id1, id2 } = action.payload
      return {
        ...state,
        selectedTileIds: [id1, id2],
        wrongMatchIds: [id1, id2],
      }
    }
    case MATCH_ACTIONS.CLEAR_WRONG_MATCH: {
      return {
        ...state,
        wrongMatchIds: [],
        selectedTileIds: [],
        penaltyTime: state.penaltyTime + PENALTY_TIME_MS,
      }
    }
    case MATCH_ACTIONS.FINISH_GAME: {
      return {
        type: GAME_STATUS.FINISHED,
        tiles: state.tiles,
        finalDuration: action.payload.duration,
      }
    }
    default:
      return state
  }
}
