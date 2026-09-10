import { z } from 'zod'

export const StudyModeSchema = z.enum(['flashcards', 'learn', 'test', 'match'])

export const StudySessionQuerySchema = z.object({
  deckId: z.string().min(1),
  mode: StudyModeSchema.optional().default('flashcards'),
  onlyStarred: z.boolean().optional(),
  onlyDue: z.boolean().optional(),
})

export const SubmitProgressItemSchema = z.object({
  flashcardId: z.string().min(1),
  isCorrect: z.boolean(),
})

export const SubmitProgressPayloadSchema = z.object({
  deckId: z.string().min(1),
  results: z.array(SubmitProgressItemSchema).min(1),
})

export const ToggleStarPayloadSchema = z.object({
  deckId: z.string().min(1),
  cardId: z.string().min(1),
  isStarred: z.boolean(),
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
  cardId: z.string().min(1),
})
