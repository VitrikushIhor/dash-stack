import { cache } from 'react'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { PublicDeckFiltersSchema } from '../../model/deck.schema'
import { deckServerApi } from '../../server/deck-api.server'

export const getPublicDecksQuery = cache(
  createServerQuery('getPublicDecksQuery', PublicDeckFiltersSchema, (filters) =>
    deckServerApi.getPublicDecks(filters)
  )
)
