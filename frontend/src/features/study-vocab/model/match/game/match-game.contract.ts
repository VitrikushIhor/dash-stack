import { type MatchAttempt } from '@/entities/vocab'
import { type SessionLifecycle } from '../../shared/session-lifecycle'
import { type GameState } from './match-game-reducer'

export interface PendingMatchPair {
  attempt: MatchAttempt
  lease: number
}

export interface MatchGameStore extends SessionLifecycle {
  gameState: GameState
  pairError: boolean
  pairRetry: number
  selectTile: (tileId: string) => void
  retryPair: () => void
  beginPair: () => PendingMatchPair | null
  finishPair: (pending: PendingMatchPair, saved: boolean) => void
  finishGame: () => boolean
}
