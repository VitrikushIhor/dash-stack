import { cache } from 'react'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { DeckIdSchema } from '../../model/deck.schema'
import { deckServerApi } from '../deck-api.server'

export const getDeckQuery = cache(
  createServerQuery('getDeckQuery', DeckIdSchema, (id) =>
    deckServerApi.getById(id)
  )
)
