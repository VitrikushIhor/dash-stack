import { cache } from 'react'
import { z } from 'zod'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { vocabServerApi } from '../vocab-api.server'

const DeckCardsQuerySchema = z.object({
  deckId: z.string().min(1),
  search: z.string().max(100).optional(),
  page: z.number().int().positive(),
  perPage: z.number().int().positive().max(100),
})

export const getDeckCardsQuery = cache(
  createServerQuery('getDeckCardsQuery', DeckCardsQuerySchema, (query) =>
    vocabServerApi.browseDeckCards(query.deckId, query)
  )
)
