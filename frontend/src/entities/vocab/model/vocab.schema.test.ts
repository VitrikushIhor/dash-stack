import { describe, expect, it } from 'vitest'
import {
  ImportFlashcardsPayloadSchema,
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
describe('ImportFlashcardsPayloadSchema', () => {
  it('should_preserve_whitespace_and_normalize_an_empty_image_url', () => {
    const parsed = ImportFlashcardsPayloadSchema.parse({
      deckId: 'deck-1',
      importId: 'import-1',
      cards: [
        {
          term: ' word ',
          definition: ' definition\n',
          example: '',
          imageUrl: '',
        },
      ],
    })

    expect(parsed.cards[0]).toEqual({
      term: ' word ',
      definition: ' definition\n',
      example: '',
      imageUrl: null,
    })
  })

  it('should_reject_whitespace_only_required_content_without_transforming_it', () => {
    const result = ImportFlashcardsPayloadSchema.safeParse({
      deckId: 'deck-1',
      importId: 'import-1',
      cards: [{ term: ' ', definition: '\n', imageUrl: null }],
    })

    expect(result.success).toBe(false)
  })
})
