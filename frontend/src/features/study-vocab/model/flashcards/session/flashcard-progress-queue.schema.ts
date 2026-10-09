import { z } from 'zod'

const PendingFlashcardAttemptSchema = z.object({
  attemptId: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9:_-]+$/),
  flashcardId: z.string().min(1),
  isCorrect: z.boolean(),
})

export const FlashcardProgressQueueSchema = z.object({
  version: z.literal(1),
  sessionId: z.string().min(1).max(64),
  results: z
    .array(
      PendingFlashcardAttemptSchema.pick({
        flashcardId: true,
        isCorrect: true,
      })
    )
    .min(1)
    .max(2000),
  pending: z.array(PendingFlashcardAttemptSchema).min(1).max(2000),
})

export const FlashcardProgressQueuesSchema = z
  .array(FlashcardProgressQueueSchema)
  .max(20)

export type FlashcardProgressQueue = z.infer<
  typeof FlashcardProgressQueueSchema
>
