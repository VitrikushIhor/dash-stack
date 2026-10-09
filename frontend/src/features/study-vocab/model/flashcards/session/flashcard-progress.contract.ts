import { type SessionLifecycle } from '../../shared/session-lifecycle'
import { type FlashcardResult } from '../../shared/types'
import { type FlashcardProgressQueue } from './flashcard-progress-queue.storage'

export const FlashcardProgressStatus = {
  IDLE: 'idle',
  WAITING_FOR_IDENTITY: 'waiting-for-identity',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error',
  GUEST: 'guest',
} as const

export type FlashcardProgressStatus =
  (typeof FlashcardProgressStatus)[keyof typeof FlashcardProgressStatus]
export type OwnedQueue = { userId: string; queue: FlashcardProgressQueue }
export type FlashcardSyncLease = { generation: number; sessionId: string }

export interface FlashcardProgressStore extends SessionLifecycle {
  ownedQueue: OwnedQueue | null
  status: FlashcardProgressStatus
  error: string | null
  isSyncing: boolean
  complete: (
    results: FlashcardResult[],
    userId: string | null | undefined
  ) => void
  resolveIdentity: (
    userId: string | null | undefined
  ) => FlashcardResult[] | null
  beginSync: () => FlashcardSyncLease | null
  isCurrent: (lease: FlashcardSyncLease) => boolean
  acknowledge: (
    queue: FlashcardProgressQueue,
    lease: FlashcardSyncLease
  ) => void
  fail: (error: unknown, lease: FlashcardSyncLease) => void
  finishSync: (lease: FlashcardSyncLease) => void
}
