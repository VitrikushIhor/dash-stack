'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { CompleteMatchSessionPayloadSchema } from '@/entities/vocab'
import { vocabServerApi } from '@/entities/vocab/server'

export const completeMatchSessionAction = createAction(
  CompleteMatchSessionPayloadSchema,
  async ({ deckId, sessionId }) => {
    const result = await vocabServerApi.completeMatchSession(deckId, sessionId)
    revalidateTag(SERVER_CACHE_TAGS.deckDetail(deckId))
    return result
  }
)
