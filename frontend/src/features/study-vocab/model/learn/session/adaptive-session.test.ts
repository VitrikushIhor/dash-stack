import { describe, expect, it } from 'vitest'
import {
  answerLearnQuestion,
  continueLearnSession,
  createLearnSession,
} from './adaptive-session'
import { type AdaptiveLearnSession } from './adaptive-session.contract'

const cards = [
  { id: 'a', term: 'apple', definition: 'A fruit' },
  { id: 'b', term: 'boat', definition: 'A vessel' },
  { id: 'c', term: 'cat', definition: 'An animal' },
  { id: 'd', term: 'door', definition: 'An entrance' },
]

function answerRound(state: AdaptiveLearnSession): AdaptiveLearnSession {
  let next = state

  for (let index = 0; index < cards.length; index += 1) {
    next = continueLearnSession(
      answerLearnQuestion(next, next.questionId, true)
    )
    next = continueLearnSession(
      answerLearnQuestion(next, next.questionId, true)
    )
  }

  return next
}

describe('adaptive Learn', () => {
  it('should_require_one_mcq_and_one_typing_success_per_card_when_learning', () => {
    let session = createLearnSession('session-1', cards)

    expect(session.cards.map((card) => card.mastery)).toEqual(
      cards.map(() => ({ stage: 'mcq', streak: 0 }))
    )

    session = answerRound(session)

    expect(session.phase).toBe('complete')
    expect(
      session.cards.every((card) => card.mastery.stage === 'mastered')
    ).toBe(true)
    expect(session.attemptCount).toBe(8)
  })

  it('should_change_only_answered_card_when_one_card_succeeds', () => {
    const initial = createLearnSession('session-1', cards)
    const next = answerLearnQuestion(initial, initial.questionId, true)

    expect(next.cards[0].mastery).toEqual({ stage: 'typing', streak: 1 })
    expect(next.cards.slice(1)).toEqual(initial.cards.slice(1))
    expect(initial.cards[0].mastery).toEqual({ stage: 'mcq', streak: 0 })
  })

  it('should_reset_to_mcq_when_a_typing_answer_is_incorrect', () => {
    const initial = createLearnSession('session-1', cards)
    const typing = continueLearnSession(
      answerLearnQuestion(initial, initial.questionId, true)
    )
    const next = answerLearnQuestion(typing, typing.questionId, false)

    expect(next.cards[0].mastery).toEqual({ stage: 'mcq', streak: 0 })
    expect(next.cards[0].incorrectCount).toBe(1)
  })

  it('should_ignore_duplicate_and_stale_answers_when_question_already_answered', () => {
    const initial = createLearnSession('session-1', cards)
    const answered = answerLearnQuestion(initial, initial.questionId, true)

    expect(answerLearnQuestion(answered, initial.questionId, true)).toBe(
      answered
    )
    const next = continueLearnSession(answered)

    expect(answerLearnQuestion(next, initial.questionId, true)).toBe(next)
    expect(next.questionId).not.toBe(initial.questionId)
    expect(next.attemptCount).toBe(1)
  })

  it('should_start_with_typing_and_complete_after_two_successes_when_only_one_card', () => {
    let session = createLearnSession('session-1', cards.slice(0, 1))

    expect(session.cards[0].mastery).toEqual({ stage: 'typing', streak: 0 })
    session = continueLearnSession(
      answerLearnQuestion(session, session.questionId, true)
    )
    expect(session.phase).toBe('question')
    session = continueLearnSession(
      answerLearnQuestion(session, session.questionId, true)
    )
    expect(session.phase).toBe('complete')
  })

  it('should_start_with_typing_when_definitions_cannot_form_four_unique_options', () => {
    const session = createLearnSession(
      'session-1',
      cards.map((card) => ({ ...card, definition: 'same' }))
    )

    expect(session.cards.every((card) => card.mastery.stage === 'typing')).toBe(
      true
    )
  })

  it('should_handle_empty_selection_without_creating_a_question', () => {
    const session = createLearnSession('session-1', [])

    expect(session.phase).toBe('complete')
    expect(answerLearnQuestion(session, session.questionId, true)).toBe(session)
  })
})
