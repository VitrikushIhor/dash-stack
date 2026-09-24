import { z } from 'zod'
import { CEFRLevelEnum, DeckVisibilityEnum } from '@/entities/deck'

export const draftStateSchema = z.object({
  metadata: z.object({
    title: z.string(),
    description: z.string(),
    language: z.string().default('en'),
    tags: z.array(z.string()).default([]),
    level: z.enum(CEFRLevelEnum),
    visibility: z.enum(DeckVisibilityEnum),
  }),
  cards: z.array(
    z.object({
      id: z.string().min(1),
      term: z.string().optional(),
      definition: z.string().optional(),
      example: z.string().nullable().optional(),
      imageUrl: z.string().nullable().optional(),
      position: z.number().optional(),
    })
  ),
  deletedCardIds: z.array(z.string()),
})

const draftSchema = z.object({
  revision: z.string(),
  state: draftStateSchema,
})

export type DeckEditorDraftState = z.infer<typeof draftStateSchema>

export const persistedSchema = z.object({ draft: draftSchema.nullable() })
export type DraftStoreState = z.infer<typeof persistedSchema>

export function createDraftSnapshot(state: DeckEditorDraftState) {
  const result = draftStateSchema.safeParse(state)

  return result.success
    ? {
        data: result.data,
        serialized: JSON.stringify(result.data),
        error: null,
      }
    : { data: null, serialized: null, error: result.error }
}
export type DraftSnapshot = ReturnType<typeof createDraftSnapshot>
