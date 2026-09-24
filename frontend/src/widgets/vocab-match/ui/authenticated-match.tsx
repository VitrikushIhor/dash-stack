'use client'

import { WidgetErrorState } from '@/shared/ui/feedback'
import { StudyMode } from '@/entities/vocab'
import {
  MatchSessionStatus,
  StudySavingState,
  StudySessionContainer,
  StudySessionSkeleton,
  StudySummary,
} from '@/features/study-vocab'
import { DynamicMatchPlayer } from './dynamic-match-player'
import { MatchLeaderboardState } from './match-leaderboard-state'
import { type MatchSessionView } from './match-session-view'

export function AuthenticatedMatch({ match }: { match: MatchSessionView }) {
  const leaderboard = <MatchLeaderboardState leaderboard={match.leaderboard} />

  if (
    match.status === MatchSessionStatus.AUTH_LOADING ||
    match.status === MatchSessionStatus.LOADING
  )
    return <StudySessionSkeleton />

  if (match.status === MatchSessionStatus.ERROR)
    return (
      <StudySessionContainer>
        <WidgetErrorState
          className='mx-auto max-w-md'
          title='Match could not continue'
          description={match.error ?? 'Try starting a new Match session.'}
          onRetry={match.retry}
        />
      </StudySessionContainer>
    )

  if (match.status === MatchSessionStatus.COMPLETE && match.completion)
    return (
      <StudySessionContainer>
        <StudySummary
          kind={StudyMode.MATCH}
          matchDurationMs={match.completion.durationMs}
          onRestart={match.restart}
        />
        {leaderboard}
      </StudySessionContainer>
    )

  if (!match.session) return <StudySessionSkeleton />

  return (
    <StudySessionContainer>
      <DynamicMatchPlayer
        key={match.session.id}
        cards={match.session.cards}
        onComplete={match.complete}
        onPairMatched={match.recordPair}
      />
      {match.status === MatchSessionStatus.COMPLETING && <StudySavingState />}
    </StudySessionContainer>
  )
}
