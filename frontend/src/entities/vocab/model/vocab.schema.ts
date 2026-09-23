import { z } from 'zod'
import { MatchTileSide, StudyMode, VocabProgressStatus } from './types'

const StudyModeSchema = z.enum([
  StudyMode.FLASHCARDS,
  StudyMode.LEARN,
  StudyMode.TEST,
  StudyMode.MATCH,
])

export const StudyCardSchema = z.object({
  id: z.string().min(1),
  deckId: z.string().min(1),
  term: z.string().min(1).max(255),
  definition: z.string().min(1).max(1000),
  example: z.string().max(500).nullable(),
  imageUrl: z.string().nullable(),
  position: z.number().int().nonnegative(),
  progress: z.object({
    id: z.string().nullable(),
    status: z.enum([
      VocabProgressStatus.NEW,
      VocabProgressStatus.LEARNING,
      VocabProgressStatus.KNOWN,
      VocabProgressStatus.MASTERED,
      VocabProgressStatus.FORGOTTEN,
    ]),
    box: z.number().int().min(1).max(5),
    isStarred: z.boolean(),
    correctStreak: z.number().int().nonnegative(),
    correctCount: z.number().int().nonnegative(),
    incorrectCount: z.number().int().nonnegative(),
    lastReviewedAt: z.string().nullable(),
    nextReviewAt: z.string().nullable(),
  }),
})

export const StudySessionQuerySchema = z.object({
  deckId: z.string().min(1),
  mode: StudyModeSchema.optional().default(StudyMode.FLASHCARDS),
  onlyStarred: z.boolean().optional(),
  onlyDue: z.boolean().optional(),
})

export const SubmitProgressItemSchema = z.object({
  flashcardId: z.string().min(1),
  isCorrect: z.boolean(),
})

export const SubmitProgressPayloadSchema = z
  .object({
    deckId: z.string().min(1),
    attemptId: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-zA-Z0-9:_-]+$/)
      .optional(),
    results: z.array(SubmitProgressItemSchema).min(1),
  })
  .refine((payload) => !payload.attemptId || payload.results.length === 1, {
    message: 'An attempt must contain exactly one answer',
    path: ['results'],
  })

export const ToggleStarPayloadSchema = z.object({
  cardId: z.string().min(1),
  isStarred: z.boolean(),
})

export const ImportFlashcardsPayloadSchema = z.object({
  deckId: z.string().min(1),
  importId: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/),
  cards: z
    .array(
      z.object({
        term: z
          .string()
          .min(1)
          .max(255)
          .refine((value) => value.trim().length > 0, 'Term must contain text'),
        definition: z
          .string()
          .min(1)
          .max(1000)
          .refine(
            (value) => value.trim().length > 0,
            'Definition must contain text'
          ),
        example: z.string().max(500).nullable().optional(),
        imageUrl: z
          .union([z.url().max(2048), z.literal('')])
          .nullable()
          .optional()
          .transform((value) => (value === '' ? null : value)),
      })
    )
    .min(1)
    .max(2000),
})

export const DueReviewsQuerySchema = z
  .object({
    deckId: z.string().optional(),
  })
  .optional()

export const MatchLeaderboardQuerySchema = z.object({
  deckId: z.string().min(1, 'Deck ID is required'),
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().max(100).optional(),
})

export const CreateMatchSessionPayloadSchema = z.object({
  deckId: z.string().min(1),
  onlyDue: z.boolean().optional(),
  onlyStarred: z.boolean().optional(),
})

export const CompleteMatchSessionPayloadSchema = z.object({
  deckId: z.string().min(1),
  sessionId: z.string().min(1),
})

export const RecordMatchPairPayloadSchema = z.object({
  deckId: z.string().min(1),
  sessionId: z.string().min(1),
  attemptId: z.uuid(),
  first: z.object({
    cardId: z.string().min(1),
    side: z.enum([MatchTileSide.TERM, MatchTileSide.DEFINITION]),
  }),
  second: z.object({
    cardId: z.string().min(1),
    side: z.enum([MatchTileSide.TERM, MatchTileSide.DEFINITION]),
  }),
})
