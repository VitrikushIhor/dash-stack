import { cache } from 'react'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { DeckIdSchema } from '../../model/deck.schema'
import { deckServerApi } from '../deck-api.server'

export const getDeckMetadataQuery = cache(
  createServerQuery('getDeckMetadataQuery', DeckIdSchema, (id) =>
    deckServerApi.getMetadata(id)
  )
)
