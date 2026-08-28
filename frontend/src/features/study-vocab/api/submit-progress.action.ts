'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { SubmitProgressPayloadSchema } from '@/entities/vocab'
import { vocabServerApi } from '@/entities/vocab/server'

export const submitProgressAction = createAction(
  SubmitProgressPayloadSchema,
  async ({ deckId, results }) => {
    const res = await vocabServerApi.submitProgress(deckId, { results })
    revalidateTag(SERVER_CACHE_TAGS.dueReviews)
    revalidateTag(SERVER_CACHE_TAGS.studySession(deckId))
    revalidateTag(SERVER_CACHE_TAGS.deckDetail(deckId))
    return res
  }
)
