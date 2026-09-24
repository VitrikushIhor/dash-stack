import { type StudyCard } from '@/entities/vocab'
import { createLearnChoices } from '../answer/answer-options'
import {
  LearnFeedbackSyncState,
  LearnPhase,
  LearnSnapshotRebuildReason,
  LearnSnapshotReconciliationKind,
  LearnStage,
} from './adaptive-session.constants'
import { type LearnSnapshot } from './adaptive-session.contract'

export type LearnSnapshotReconciliation =
  | {
      kind: typeof LearnSnapshotReconciliationKind.Reconciled
      snapshot: LearnSnapshot
    }
  | {
      kind: typeof LearnSnapshotReconciliationKind.RebuildRequired
      reason: (typeof LearnSnapshotRebuildReason)[keyof typeof LearnSnapshotRebuildReason]
    }

export function reconcileLearnSnapshot(
  snapshot: LearnSnapshot,
  currentCards: StudyCard[]
): LearnSnapshotReconciliation {
  if (currentCards.length === 0) {
    return { kind: LearnSnapshotReconciliationKind.Reconciled, snapshot }
  }

  const currentCardIds = new Set(currentCards.map((card) => card.id))
  const activeCard = snapshot.cards[snapshot.session.currentIndex]

  if (
    snapshot.feedback?.sync === LearnFeedbackSyncState.Pending &&
    (!activeCard || !currentCardIds.has(activeCard.id))
  ) {
    return {
      kind: LearnSnapshotReconciliationKind.RebuildRequired,
      reason: LearnSnapshotRebuildReason.PendingCardDeleted,
    }
  }

  if (
    snapshot.cards.length !== currentCards.length ||
    snapshot.cards.some((card) => !currentCardIds.has(card.id))
  ) {
    return {
      kind: LearnSnapshotReconciliationKind.RebuildRequired,
      reason: LearnSnapshotRebuildReason.CardSetChanged,
    }
  }

  const current = currentCards[snapshot.session.currentIndex]
  const sessionCard = snapshot.session.cards[snapshot.session.currentIndex]
  const choices =
    snapshot.session.phase === LearnPhase.Question &&
    current &&
    sessionCard?.mastery.stage === LearnStage.Mcq
      ? createLearnChoices(current, currentCards)
      : null

  return {
    kind: LearnSnapshotReconciliationKind.Reconciled,
    snapshot: {
      ...snapshot,
      cards: currentCards,
      choices,
    },
  }
}
