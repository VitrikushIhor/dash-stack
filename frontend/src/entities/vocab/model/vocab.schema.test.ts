import { describe, expect, it } from 'vitest'
import {
  RecordMatchPairPayloadSchema,
  SubmitProgressPayloadSchema,
} from './vocab.schema'

describe('Learn progress payload', () => {
  it('should_preserve_attempt_id_when_one_answer_is_submitted', () => {
    const payload = {
      deckId: 'deck',
      attemptId: 'session:1',
      results: [{ flashcardId: 'card', isCorrect: true }],
    }
    expect(SubmitProgressPayloadSchema.parse(payload)).toEqual(payload)
  })
  it('should_reject_multiple_answers_when_an_attempt_id_is_supplied', () => {
    expect(
      SubmitProgressPayloadSchema.safeParse({
        deckId: 'deck',
        attemptId: 'session:1',
        results: [
          { flashcardId: 'card', isCorrect: true },
          { flashcardId: 'other', isCorrect: false },
        ],
      }).success
    ).toBe(false)
  })
})

describe('RecordMatchPairPayloadSchema', () => {
  it('accepts the trusted Match pair identity', () => {
    expect(
      RecordMatchPairPayloadSchema.safeParse({
        deckId: 'deck-1',
        sessionId: 'session-1',
        cardId: 'card-1',
      }).success
    ).toBe(true)
  })

  it('rejects a Match pair without its session identity', () => {
    expect(
      RecordMatchPairPayloadSchema.safeParse({
        deckId: 'deck-1',
        cardId: 'card-1',
      }).success
    ).toBe(false)
  })
})
