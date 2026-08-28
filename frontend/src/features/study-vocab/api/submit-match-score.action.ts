'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { SubmitMatchScorePayloadSchema } from '@/entities/vocab'
import { vocabServerApi } from '@/entities/vocab/server'

export const submitMatchScoreAction = createAction(
  SubmitMatchScorePayloadSchema,
  async ({ deckId, durationMs }) => {
    const res = await vocabServerApi.submitMatchScore(deckId, { durationMs })
    revalidateTag(SERVER_CACHE_TAGS.dueReviews)
    revalidateTag(SERVER_CACHE_TAGS.studySession(deckId))
    revalidateTag(SERVER_CACHE_TAGS.deckDetail(deckId))
    return res
  }
)
