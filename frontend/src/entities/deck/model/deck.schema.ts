import { z } from 'zod'
import { CEFRLevelEnum, DeckVisibilityEnum } from './types'

export const CreateDeckSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must not exceed 100 characters'),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  language: z.string(),
  level: z
    .enum([
      CEFRLevelEnum.A1,
      CEFRLevelEnum.A2,
      CEFRLevelEnum.B1,
      CEFRLevelEnum.B2,
      CEFRLevelEnum.C1,
      CEFRLevelEnum.C2,
    ])
    .optional(),
  tags: z.array(z.string()),
  visibility: z.enum([
    DeckVisibilityEnum.PRIVATE,
    DeckVisibilityEnum.PUBLIC,
    DeckVisibilityEnum.UNLISTED,
  ]),
})

export type CreateDeckFormValues = z.infer<typeof CreateDeckSchema>

export const FlashcardSchema = z.object({
  term: z
    .string()
    .min(1, 'Term is required')
    .max(255, 'Term must not exceed 255 characters'),
  definition: z
    .string()
    .min(1, 'Definition is required')
    .max(1000, 'Definition must not exceed 1000 characters'),
  example: z
    .string()
    .max(500, 'Example must not exceed 500 characters')
    .optional(),
  imageUrl: z.url('Must be a valid URL').optional().or(z.literal('')),
})

export const DeckEditorSaveResponseSchema = z.object({
  flashcards: z.array(
    z.object({
      id: z.string(),
      deckId: z.string(),
      term: z.string(),
      definition: z.string(),
      position: z.number(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
  ),
})

export type FlashcardFormValues = z.infer<typeof FlashcardSchema>

export const PublicDeckFiltersSchema = z
  .object({
    q: z.string().optional(),
    level: z.string().optional(),
    language: z.string().optional(),
    tags: z.array(z.string()).optional(),
    page: z.number().optional(),
    perPage: z.number().optional(),
  })
  .optional()

export const SearchUnsplashPayloadSchema = z.object({
  query: z.string(),
  page: z.number().optional().default(1),
  perPage: z.number().optional().default(18),
})

export const DeckIdSchema = z.string().min(1, 'Deck ID is required')

export const DeckIdPayloadSchema = z.object({ id: DeckIdSchema })

export const UpdateDeckPayloadSchema = z.object({
  id: z.string(),
  data: CreateDeckSchema.partial(),
})

export const SaveDeckEditorPayloadSchema = z.object({
  id: DeckIdSchema,
  data: z.object({
    operationId: z.uuid(),
    expectedUpdatedAt: z.iso.datetime(),
    metadata: CreateDeckSchema.partial(),
    cards: z
      .array(FlashcardSchema.extend({ id: z.string().optional() }))
      .max(2000),
    deletedCardIds: z.array(z.string()),
  }),
})

export const CreateFlashcardPayloadSchema = z.object({
  deckId: z.string(),
  data: FlashcardSchema,
})

export const UpdateFlashcardPayloadSchema = z.object({
  deckId: z.string(),
  cardId: z.string(),
  data: FlashcardSchema.partial(),
})

export const DeleteFlashcardPayloadSchema = z.object({
  deckId: z.string(),
  cardId: z.string(),
})

export const BatchSaveFlashcardsPayloadSchema = z.object({
  deckId: z.string(),
  cards: z.array(
    FlashcardSchema.extend({
      id: z.string().optional(),
      isNew: z.boolean().optional(),
      position: z.number().optional(),
    })
  ),
  deletedCardIds: z.array(z.string()).optional(),
})

export const ReorderFlashcardsPayloadSchema = z.object({
  deckId: z.string(),
  orderedCardIds: z.array(z.string()),
})
