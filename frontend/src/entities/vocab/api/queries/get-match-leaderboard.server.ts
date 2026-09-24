import { cache } from 'react'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { MatchLeaderboardQuerySchema } from '../../model/vocab.schema'
import { vocabServerApi } from '../vocab-api.server'

export const getMatchLeaderboardQuery = cache(
  createServerQuery(
    'getMatchLeaderboardQuery',
    MatchLeaderboardQuerySchema,
    ({ deckId, page, perPage }) =>
      vocabServerApi.getLeaderboard(deckId, { page, perPage })
  )
)
