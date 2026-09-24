'use client'

import { type Deck } from '@/entities/deck'
import { type StudyCard } from '@/entities/vocab'
import { MatchSessionStatus, useMatchSession } from '@/features/study-vocab'
import { AuthenticatedMatch } from './authenticated-match'
import { GuestMatch } from './guest-match'

interface VocabMatchProps {
  deck: Deck
  filters: { onlyDue: boolean; onlyStarred: boolean }
  initialCards: StudyCard[]
}

export function VocabMatch({ deck, filters, initialCards }: VocabMatchProps) {
  const match = useMatchSession(deck.id, filters)
  if (match.status === MatchSessionStatus.GUEST)
    return <GuestMatch cards={initialCards} match={match} />

  return <AuthenticatedMatch match={match} />
}
