import { z } from 'zod'

export const DeckCardsQuerySchema = z.object({
  deckId: z.string().min(1),
  search: z.string().max(100).optional(),
  page: z.number().int().positive(),
  perPage: z.number().int().positive().max(100),
})
