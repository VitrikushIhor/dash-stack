'use server'

import { createAction } from '@/shared/lib'
import { RecordMatchPairPayloadSchema } from '@/entities/vocab'
import { vocabServerApi } from '@/entities/vocab/server'

export const recordMatchPairAction = createAction(
  RecordMatchPairPayloadSchema,
  async ({ deckId, sessionId, cardId }) => {
    await vocabServerApi.recordMatchPair(deckId, sessionId, cardId)
    return { cardId }
  }
)
