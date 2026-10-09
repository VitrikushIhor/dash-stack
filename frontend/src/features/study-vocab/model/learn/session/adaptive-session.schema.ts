import { z } from 'zod'
import { StudyCardSchema } from '@/entities/vocab'
import {
  LearnAnswerEvaluationKind,
  LearnFeedbackSyncState,
  LearnPhase,
  LearnStage,
} from './adaptive-session.constants'
import { type AdaptiveLearnSession } from './adaptive-session.contract'

export const LEARN_SESSION_MAX_CARDS = 500

const AdaptiveLearnSessionSchema = z.object({
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
    .max(LEARN_SESSION_MAX_CARDS),
  currentIndex: z.number().int().nonnegative(),
  questionId: z.string().min(1).max(100),
  attemptCount: z.number().int().nonnegative(),
  phase: z.enum([
    LearnPhase.Question,
    LearnPhase.Feedback,
    LearnPhase.Complete,
  ]),
}) satisfies z.ZodType<AdaptiveLearnSession>

export const LearnSnapshotSchema = z
  .object({
    version: z.literal(1),
    cards: z.array(StudyCardSchema).max(LEARN_SESSION_MAX_CARDS),
    session: AdaptiveLearnSessionSchema,
    choices: z
      .array(z.object({ id: z.string(), definition: z.string() }))
      .length(4)
      .nullable(),
    feedback: z
      .object({
        answer: z.string().max(1000),
        kind: z.enum([
          LearnAnswerEvaluationKind.Exact,
          LearnAnswerEvaluationKind.Normalized,
          LearnAnswerEvaluationKind.Almost,
          LearnAnswerEvaluationKind.Incorrect,
        ]),
        sync: z.enum([
          LearnFeedbackSyncState.Pending,
          LearnFeedbackSyncState.Saved,
          LearnFeedbackSyncState.Guest,
        ]),
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
