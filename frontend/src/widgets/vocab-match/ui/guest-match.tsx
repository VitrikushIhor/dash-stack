'use client'

import { useState } from 'react'
import { type StudyCard, StudyMode } from '@/entities/vocab'
import {
  MAX_MATCH_CARDS,
  StudySessionContainer,
  StudySummary,
} from '@/features/study-vocab'
import { DynamicMatchPlayer } from './dynamic-match-player'
import { MatchLeaderboardState } from './match-leaderboard-state'
import { type MatchSessionView } from './match-session-view'

export function GuestMatch({
  cards,
  match,
}: {
  cards: StudyCard[]
  match: MatchSessionView
}) {
  const [durationMs, setDurationMs] = useState<number | null>(null)
  const leaderboard = <MatchLeaderboardState leaderboard={match.leaderboard} />
  const playableCards = cards.slice(0, MAX_MATCH_CARDS)

  if (durationMs !== null)
    return (
      <StudySessionContainer>
        <StudySummary
          kind={StudyMode.MATCH}
          matchDurationMs={durationMs}
          onRestart={() => setDurationMs(null)}
        />
        {leaderboard}
      </StudySessionContainer>
    )

  return (
    <StudySessionContainer>
      <DynamicMatchPlayer
        cards={playableCards}
        onComplete={(completedDurationMs) =>
          setDurationMs(completedDurationMs ?? 0)
        }
        onPairMatched={async () => true}
      />
      {leaderboard}
    </StudySessionContainer>
  )
}
