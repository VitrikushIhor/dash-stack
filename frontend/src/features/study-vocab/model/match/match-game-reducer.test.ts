import { describe, expect, it } from 'vitest'
import { type StudyCard, VocabProgressStatus } from '@/entities/vocab'
import {
  MAX_MATCH_CARDS,
  MIN_MATCH_CARDS,
  PENALTY_TIME_MS,
} from '../shared/constants'
import {
  GAME_STATUS,
  type GamePlaying,
  type GameState,
  MATCH_ACTIONS,
  TILE_TYPES,
  createInitialTiles,
  gameReducer,
} from './match-game-reducer'

const mockCards: StudyCard[] = Array.from({ length: 15 }, (_, i) => ({
  id: `card-${i + 1}`,
  deckId: 'deck-1',
  term: `Term ${i + 1}`,
  definition: `Def ${i + 1}`,
  example: null,
  imageUrl: null,
  position: i,
  progress: {
    id: `prog-${i + 1}`,
    isStarred: false,
    status: VocabProgressStatus.LEARNING,
    box: 1,
    correctStreak: 0,
    correctCount: 0,
    incorrectCount: 0,
    lastReviewedAt: null,
    nextReviewAt: new Date().toISOString(),
  },
}))

describe('match-game-reducer', () => {
  describe('createInitialTiles', () => {
    it('throws error when cards count is less than MIN_MATCH_CARDS', () => {
      expect(() =>
        createInitialTiles(mockCards.slice(0, MIN_MATCH_CARDS - 1))
      ).toThrow(`Match game requires at least ${MIN_MATCH_CARDS} cards`)
    })

    it('creates matching pairs from the server-selected cards', () => {
      const tiles = createInitialTiles(mockCards.slice(0, MAX_MATCH_CARDS))

      expect(tiles).toHaveLength(MAX_MATCH_CARDS * 2)

      const termTiles = tiles.filter((t) => t.type === TILE_TYPES.TERM)
      const defTiles = tiles.filter((t) => t.type === TILE_TYPES.DEFINITION)

      expect(termTiles).toHaveLength(MAX_MATCH_CARDS)
      expect(defTiles).toHaveLength(MAX_MATCH_CARDS)

      expect(tiles.every((t) => !t.isMatched)).toBe(true)
    })

    it('rejects more cards than a server session may contain', () => {
      expect(() => createInitialTiles(mockCards)).toThrow(
        `Match game supports at most ${MAX_MATCH_CARDS} server-selected cards`
      )
    })
  })

  describe('gameReducer', () => {
    const createPlayingState = (
      overrides: Partial<GamePlaying> = {}
    ): GamePlaying => ({
      type: GAME_STATUS.PLAYING,
      tiles: [
        {
          id: 'term-1',
          cardId: 'c1',
          type: TILE_TYPES.TERM,
          text: 'T1',
          isMatched: false,
        },
        {
          id: 'def-1',
          cardId: 'c1',
          type: TILE_TYPES.DEFINITION,
          text: 'D1',
          isMatched: false,
        },
        {
          id: 'term-2',
          cardId: 'c2',
          type: TILE_TYPES.TERM,
          text: 'T2',
          isMatched: false,
        },
        {
          id: 'def-2',
          cardId: 'c2',
          type: TILE_TYPES.DEFINITION,
          text: 'D2',
          isMatched: false,
        },
      ],
      selectedTileIds: [],
      wrongMatchIds: [],
      startTime: 1000,
      penaltyTime: 0,
      ...overrides,
    })

    it('handles SELECT_TILE for the first tile', () => {
      const state = createPlayingState()
      const nextState = gameReducer(state, {
        type: MATCH_ACTIONS.SELECT_TILE,
        payload: 'term-1',
      }) as GamePlaying

      expect(nextState.selectedTileIds).toEqual(['term-1'])
      expect(nextState.wrongMatchIds).toEqual([])
    })

    it('handles SELECT_TILE for a matching second tile', () => {
      const state = createPlayingState({ selectedTileIds: ['term-1'] })
      const nextState = gameReducer(state, {
        type: MATCH_ACTIONS.SELECT_TILE,
        payload: 'def-1',
      }) as GamePlaying

      expect(nextState.selectedTileIds).toEqual(['term-1', 'def-1'])
      expect(nextState.wrongMatchIds).toEqual([])
    })

    it('handles SELECT_TILE for a mismatched second tile', () => {
      const state = createPlayingState({ selectedTileIds: ['term-1'] })
      const nextState = gameReducer(state, {
        type: MATCH_ACTIONS.SELECT_TILE,
        payload: 'def-2',
      }) as GamePlaying

      expect(nextState.selectedTileIds).toEqual(['term-1', 'def-2'])
      expect(nextState.wrongMatchIds).toEqual(['term-1', 'def-2'])
    })

    it('deselects the first tile when it is selected again', () => {
      const state1 = createPlayingState({ selectedTileIds: ['term-1'] })
      const nextState = gameReducer(state1, {
        type: MATCH_ACTIONS.SELECT_TILE,
        payload: 'term-1',
      }) as GamePlaying

      expect(nextState.selectedTileIds).toEqual([])
      expect(nextState.wrongMatchIds).toEqual([])
    })

    it('ignores SELECT_TILE while a wrong match is visible', () => {
      const state2 = createPlayingState({ wrongMatchIds: ['term-1', 'def-2'] })
      const blockedState = gameReducer(state2, {
        type: MATCH_ACTIONS.SELECT_TILE,
        payload: 'term-2',
      })

      expect(blockedState).toBe(state2)
    })

    it('ignores SELECT_TILE on already matched tiles', () => {
      const state = createPlayingState({
        tiles: [
          {
            id: 'term-1',
            cardId: 'c1',
            type: TILE_TYPES.TERM,
            text: 'T1',
            isMatched: true,
          },
          {
            id: 'def-1',
            cardId: 'c1',
            type: TILE_TYPES.DEFINITION,
            text: 'D1',
            isMatched: true,
          },
        ],
      })
      const nextState = gameReducer(state, {
        type: MATCH_ACTIONS.SELECT_TILE,
        payload: 'term-1',
      })

      expect(nextState).toBe(state)
    })

    it('handles MATCH_SUCCESS and sets endTime when all tiles matched', () => {
      const state = createPlayingState({
        selectedTileIds: ['term-1', 'def-1'],
        tiles: [
          {
            id: 'term-1',
            cardId: 'c1',
            type: TILE_TYPES.TERM,
            text: 'T1',
            isMatched: false,
          },
          {
            id: 'def-1',
            cardId: 'c1',
            type: TILE_TYPES.DEFINITION,
            text: 'D1',
            isMatched: false,
          },
        ],
      })

      const nextState = gameReducer(state, {
        type: MATCH_ACTIONS.MATCH_SUCCESS,
        payload: { id1: 'term-1', id2: 'def-1' },
      }) as GamePlaying

      expect(nextState.tiles.every((t) => t.isMatched)).toBe(true)
      expect(nextState.selectedTileIds).toEqual([])
      expect(nextState.endTime).toBeDefined()
    })

    it('handles CLEAR_WRONG_MATCH adding penalty time', () => {
      const state = createPlayingState({
        selectedTileIds: ['term-1', 'def-2'],
        wrongMatchIds: ['term-1', 'def-2'],
        penaltyTime: 0,
      })

      const nextState = gameReducer(state, {
        type: MATCH_ACTIONS.CLEAR_WRONG_MATCH,
      }) as GamePlaying

      expect(nextState.selectedTileIds).toEqual([])
      expect(nextState.wrongMatchIds).toEqual([])
      expect(nextState.penaltyTime).toBe(PENALTY_TIME_MS)
    })

    it('handles FINISH_GAME transitioning to FINISHED status', () => {
      const state = createPlayingState()
      const nextState = gameReducer(state, {
        type: MATCH_ACTIONS.FINISH_GAME,
        payload: { duration: 5400 },
      })

      expect(nextState.type).toBe(GAME_STATUS.FINISHED)
      if (nextState.type === GAME_STATUS.FINISHED) {
        expect(nextState.finalDuration).toBe(5400)
      }
    })

    it('ignores further actions once FINISHED', () => {
      const state: GameState = {
        type: GAME_STATUS.FINISHED,
        tiles: [],
        finalDuration: 5000,
      }

      const nextState = gameReducer(state, {
        type: MATCH_ACTIONS.SELECT_TILE,
        payload: 'term-1',
      })

      expect(nextState).toBe(state)
    })
  })
})
