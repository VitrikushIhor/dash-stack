'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { ToggleStarPayloadSchema } from '@/entities/vocab'
import { vocabServerApi } from '@/entities/vocab/server'

export const toggleStarAction = createAction(
  ToggleStarPayloadSchema,
  async ({ deckId, cardId, isStarred }) => {
    const res = await vocabServerApi.toggleStar(cardId, { isStarred })
    revalidateTag(SERVER_CACHE_TAGS.studySession(deckId))
    return res
  }
)
