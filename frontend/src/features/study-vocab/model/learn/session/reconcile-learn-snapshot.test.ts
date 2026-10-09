import { describe, expect, it } from 'vitest'
import { type StudyCard } from '@/entities/vocab'
import { LearnPhase, LearnStage } from './adaptive-session.constants'
import { type LearnSnapshot } from './adaptive-session.contract'
import { reconcileLearnSnapshot } from './reconcile-learn-snapshot'

const cards: StudyCard[] = ['apple', 'boat'].map((term, position) => ({
  id: `card-${position + 1}`,
  deckId: 'deck-1',
  term,
  definition: `Definition ${term}`,
  example: null,
  imageUrl: null,
  position,
  progress: {
    id: null,
    status: 'NEW',
    box: 1,
    isStarred: false,
    correctStreak: 0,
    correctCount: 0,
    incorrectCount: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
  },
}))

function snapshot(): LearnSnapshot {
  return {
    version: 1,
    cards,
    session: {
      sessionId: 'session-1',
      cards: [
        {
          id: 'card-1',
          requiresMcq: false,
          mastery: { stage: LearnStage.Mastered },
          incorrectCount: 1,
        },
        {
          id: 'card-2',
          requiresMcq: false,
          mastery: { stage: LearnStage.Typing, streak: 1 },
          incorrectCount: 0,
        },
      ],
      currentIndex: 1,
      questionId: 'session-1:2',
      attemptCount: 2,
      phase: LearnPhase.Question,
    },
    choices: null,
    feedback: null,
  }
}

describe('reconcileLearnSnapshot', () => {
  it('keeps mastery while refreshing content for unchanged card ids', () => {
    const updatedCards = cards.map((card) => ({
      ...card,
      definition: `${card.definition} updated`,
    }))

    const result = reconcileLearnSnapshot(snapshot(), updatedCards)

    expect(result.kind).toBe('reconciled')
    if (result.kind !== 'reconciled') return
    expect(result.snapshot.cards).toEqual(updatedCards)
    expect(result.snapshot.session.cards[0]?.mastery).toEqual({
      stage: LearnStage.Mastered,
    })
  })

  it('requires rebuild instead of retrying a pending answer for a deleted current card', () => {
    const pending = snapshot()
    pending.session.phase = LearnPhase.Feedback
    pending.feedback = { answer: 'boat', kind: 'exact', sync: 'pending' }

    const result = reconcileLearnSnapshot(pending, [cards[0]!])

    expect(result).toEqual({
      kind: 'rebuild-required',
      reason: 'pending-card-deleted',
    })
  })
})
