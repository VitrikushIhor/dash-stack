import { cache } from 'react'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { deckServerApi } from '../deck-api.server'
import { GetMyDecksSchema } from './get-my-decks.schema'

export const getMyDecksQuery = cache(
  createServerQuery('getMyDecksQuery', GetMyDecksSchema, (status) =>
    deckServerApi.getMyDecks(status)
  )
)
