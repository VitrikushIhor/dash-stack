import { beforeEach, describe, expect, it } from 'vitest'
import { type StudyCard } from '@/entities/vocab'
import { answerLearnQuestion } from './adaptive-session'
import {
  createLearnSnapshot,
  loadLearnSnapshot,
  saveLearnSnapshot,
} from './adaptive-session.storage'

export const learnCards: StudyCard[] = ['apple', 'boat', 'cat', 'door'].map(
  (term, position) => ({
    id: `card-${position}`,
    deckId: 'deck',
    term,
    definition: `Meaning of ${term}`,
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
  })
)

beforeEach(() => localStorage.clear())

describe('Learn session storage', () => {
  it('should_restore_streak_and_pending_attempt_when_session_was_interrupted', () => {
    const snapshot = createLearnSnapshot(learnCards)

    snapshot.session = answerLearnQuestion(
      snapshot.session,
      snapshot.session.questionId,
      true
    )
    snapshot.feedback = {
      answer: learnCards[0].definition,
      kind: 'exact',
      sync: 'pending',
    }
    saveLearnSnapshot('learn:user:deck', snapshot)

    expect(loadLearnSnapshot('learn:user:deck', 'deck')).toEqual(snapshot)
    expect(loadLearnSnapshot('learn:another-user:deck', 'deck')).toBeNull()
  })
  it('should_reject_invalid_storage_without_silently_resetting_when_json_is_corrupt', () => {
    localStorage.setItem('learn', '{broken')
    expect(() => loadLearnSnapshot('learn', 'deck')).toThrow()
  })
  it('should_reject_foreign_cards_when_saved_deck_does_not_match', () => {
    saveLearnSnapshot('learn', createLearnSnapshot(learnCards))
    expect(() => loadLearnSnapshot('learn', 'other')).toThrow()
  })
  it('should_preserve_question_choices_when_reloaded_before_answer', () => {
    const snapshot = createLearnSnapshot(learnCards)

    saveLearnSnapshot('learn', snapshot)
    expect(loadLearnSnapshot('learn', 'deck')?.choices).toEqual(
      snapshot.choices
    )
  })
  it('should_reject_inconsistent_card_state_when_storage_was_modified', () => {
    const snapshot = createLearnSnapshot(learnCards)

    localStorage.setItem(
      'learn',
      JSON.stringify({
        ...snapshot,
        session: { ...snapshot.session, currentIndex: 40 },
      })
    )
    expect(() => loadLearnSnapshot('learn', 'deck')).toThrow()
  })
})
