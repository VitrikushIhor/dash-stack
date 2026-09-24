'use client'

import { Skeleton } from '@/shared/ui/core/skeleton'
import { WidgetErrorState } from '@/shared/ui/feedback'
import { MatchLeaderboard } from '@/features/study-vocab'
import { type MatchSessionView } from './match-session-view'

export function MatchLeaderboardState({
  leaderboard,
}: {
  leaderboard: MatchSessionView['leaderboard']
}) {
  if (leaderboard.data) return <MatchLeaderboard board={leaderboard.data} />

  if (leaderboard.isError)
    return (
      <WidgetErrorState
        className='mx-auto mt-8 max-w-xl'
        title='Leaderboard could not be loaded'
        description='Try loading the leaderboard again.'
        onRetry={() => void leaderboard.refetch()}
      />
    )

  return (
    <div
      aria-label='Loading leaderboard'
      className='mx-auto mt-8 max-w-xl space-y-3'
    >
      <Skeleton className='h-7 w-40' />
      <Skeleton className='h-16 w-full rounded-xl' />
      <Skeleton className='h-16 w-full rounded-xl' />
    </div>
  )
}
