import { z } from 'zod'
import { type StudyCard, StudyCardSchema } from '@/entities/vocab'
import { createLearnChoices } from '../answer/answer-options'
import { createLearnSession } from './adaptive-session'
import { LearnPhase, LearnStage } from './adaptive-session.constants'
import {
  type AdaptiveLearnSession,
  type LearnSnapshot,
} from './adaptive-session.contract'

const sessionSchema = z.object({
  sessionId: z.string().min(1),
  cards: z
    .array(
      z.object({
        id: z.string().min(1),
        requiresMcq: z.boolean().default(true),
        mastery: z.union([
          z.object({
            stage: z.enum([LearnStage.Mcq, LearnStage.Typing]),
            streak: z.union([z.literal(0), z.literal(1)]),
          }),
          z.object({ stage: z.literal(LearnStage.Mastered) }),
        ]),
        incorrectCount: z.number().int().nonnegative(),
      })
    )
    .max(500),
  currentIndex: z.number().int().nonnegative(),
  questionId: z.string().min(1).max(100),
  attemptCount: z.number().int().nonnegative(),
  phase: z.enum([
    LearnPhase.Question,
    LearnPhase.Feedback,
    LearnPhase.Complete,
  ]),
}) satisfies z.ZodType<AdaptiveLearnSession>

const snapshotSchema = z
  .object({
    version: z.literal(1),
    cards: z.array(StudyCardSchema).max(500),
    session: sessionSchema,
    choices: z
      .array(z.object({ id: z.string(), definition: z.string() }))
      .length(4)
      .nullable(),
    feedback: z
      .object({
        answer: z.string().max(1000),
        kind: z.enum(['exact', 'normalized', 'almost', 'incorrect']),
        sync: z.enum(['pending', 'saved', 'guest']),
      })
      .nullable(),
  })
  .refine(
    ({ cards, session, feedback }) =>
      cards.length === session.cards.length &&
      new Set(cards.map((card) => card.id)).size === cards.length &&
      cards.every((card, index) => card.id === session.cards[index].id) &&
      (cards.length === 0 || session.currentIndex < cards.length) &&
      (session.phase === LearnPhase.Feedback) === (feedback !== null) &&
      (session.phase !== LearnPhase.Complete ||
        session.cards.every(
          (card) => card.mastery.stage === LearnStage.Mastered
        ))
  )

export function createLearnSnapshot(cards: StudyCard[]): LearnSnapshot {
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
  const snapshot = snapshotSchema.parse(parsed)
  if (snapshot.cards.some((card) => card.deckId !== deckId)) {
    throw new Error('Saved Learn session belongs to a different deck')
  }
  return snapshot
}

export function saveLearnSnapshot(key: string, snapshot: LearnSnapshot): void {
  localStorage.setItem(key, JSON.stringify(snapshot))
}
