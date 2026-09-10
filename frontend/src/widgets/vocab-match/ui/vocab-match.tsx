'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/shared/ui/core/skeleton'
import { WidgetErrorState } from '@/shared/ui/feedback'
import { type Deck } from '@/entities/deck'
import {
  GuestStudySaveProgressCta,
  MatchLeaderboard,
  MatchSessionStatus,
  StudySavingState,
  StudySessionContainer,
  StudySessionSkeleton,
  StudySummary,
  useMatchSession,
} from '@/features/study-vocab'

const MatchPlayer = dynamic(
  () => import('@/features/study-vocab').then((mod) => mod.MatchPlayer),
  {
    ssr: false,
    loading: () => <StudySessionSkeleton />,
  }
)

interface VocabMatchProps {
  deck: Deck
  filters: { onlyDue: boolean; onlyStarred: boolean }
}

export function VocabMatch({ deck, filters }: VocabMatchProps) {
  const match = useMatchSession(deck.id, filters)

  const leaderboard = match.leaderboard.data ? (
    <MatchLeaderboard board={match.leaderboard.data} />
  ) : match.leaderboard.isError ? (
    <WidgetErrorState
      className='mx-auto mt-8 max-w-xl'
      title='Leaderboard could not be loaded'
      description='Try loading the leaderboard again.'
      onRetry={() => void match.leaderboard.refetch()}
    />
  ) : (
    <div
      aria-label='Loading leaderboard'
      className='mx-auto mt-8 max-w-xl space-y-3'
    >
      <Skeleton className='h-7 w-40' />
      <Skeleton className='h-16 w-full rounded-xl' />
      <Skeleton className='h-16 w-full rounded-xl' />
    </div>
  )

  if (match.status === MatchSessionStatus.GUEST) {
    return (
      <StudySessionContainer>
        <GuestStudySaveProgressCta />
        {leaderboard}
      </StudySessionContainer>
    )
  }
  if (
    match.status === MatchSessionStatus.AUTH_LOADING ||
    match.status === MatchSessionStatus.LOADING
  )
    return <StudySessionSkeleton />
  if (match.status === MatchSessionStatus.ERROR) {
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
  }
  if (match.status === MatchSessionStatus.COMPLETE && match.completion) {
    return (
      <StudySessionContainer>
        <StudySummary
          kind='match'
          matchDurationMs={match.completion.durationMs}
          onRestart={match.restart}
        />
        {leaderboard}
      </StudySessionContainer>
    )
  }
  if (!match.session) return <StudySessionSkeleton />

  return (
    <StudySessionContainer>
      <MatchPlayer
        key={match.session.id}
        cards={match.session.cards}
        onComplete={match.complete}
        onPairMatched={match.recordPair}
      />
      {match.status === MatchSessionStatus.COMPLETING && <StudySavingState />}
    </StudySessionContainer>
  )
}
