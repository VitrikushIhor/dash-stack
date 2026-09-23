import { type StudyCard } from '@/entities/vocab'
import { createLearnChoices } from '../answer/answer-options'
import { createLearnSession } from './adaptive-session'
import { LearnStage } from './adaptive-session.constants'
import { type LearnSnapshot } from './adaptive-session.contract'
import {
  LEARN_SESSION_MAX_CARDS,
  LearnSnapshotSchema,
} from './adaptive-session.schema'

export { LEARN_SESSION_MAX_CARDS } from './adaptive-session.schema'

export function createLearnSnapshot(cards: StudyCard[]): LearnSnapshot {
  if (cards.length > LEARN_SESSION_MAX_CARDS) {
    throw new Error(
      `Learn sessions support at most ${LEARN_SESSION_MAX_CARDS} cards`
    )
  }
  const session = createLearnSession(crypto.randomUUID(), cards)

  return {
    version: 1,
    cards,
    session,
    choices:
      cards[0] && session.cards[0].mastery.stage === LearnStage.Mcq
        ? createLearnChoices(cards[0], cards)
        : null,
    feedback: null,
  }
}

export function loadLearnSnapshot(
  key: string,
  deckId: string
): LearnSnapshot | null {
  const raw = localStorage.getItem(key)

  if (!raw) return null
  const parsed: unknown = JSON.parse(raw)
  const snapshot = LearnSnapshotSchema.parse(parsed)

  if (snapshot.cards.some((card) => card.deckId !== deckId)) {
    throw new Error('Saved Learn session belongs to a different deck')
  }

  return snapshot
}

export function saveLearnSnapshot(key: string, snapshot: LearnSnapshot): void {
  localStorage.setItem(key, JSON.stringify(snapshot))
}
