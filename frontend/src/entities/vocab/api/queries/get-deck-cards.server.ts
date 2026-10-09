import { cache } from 'react'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { vocabServerApi } from '../vocab-api.server'
import { DeckCardsQuerySchema } from './get-deck-cards.schema'

export const getDeckCardsQuery = cache(
  createServerQuery('getDeckCardsQuery', DeckCardsQuerySchema, (query) =>
    vocabServerApi.browseDeckCards(query.deckId, query)
  )
)
