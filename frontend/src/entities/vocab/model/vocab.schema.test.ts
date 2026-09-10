import { describe, expect, it } from 'vitest'
import { RecordMatchPairPayloadSchema } from './vocab.schema'

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
