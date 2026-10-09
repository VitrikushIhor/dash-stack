'use client'

import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import { vocabApi } from '../api/vocab-api'
import { vocabKeys } from '../api/vocab-query-keys'
import { type MatchLeaderboard } from './types'

interface UseMatchLeaderboardOptions {
  enabled?: boolean
}

export function useMatchLeaderboard(
  deckId: string,
  { enabled = true }: UseMatchLeaderboardOptions = {}
): UseQueryResult<MatchLeaderboard> {
  return useQuery({
    queryKey: vocabKeys.leaderboard(deckId),
    queryFn: () => vocabApi.getLeaderboard(deckId),
    enabled,
    retry: false,
  })
}
