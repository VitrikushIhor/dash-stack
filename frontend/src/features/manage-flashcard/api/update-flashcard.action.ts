'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { UpdateFlashcardPayloadSchema } from '@/entities/deck'
import { flashcardServerApi } from '@/entities/deck/server'

export const updateFlashcardAction = createAction(
  UpdateFlashcardPayloadSchema,
  async ({ deckId, cardId, data }) => {
    const res = await flashcardServerApi.update(deckId, cardId, data)

    revalidateTag(SERVER_CACHE_TAGS.deckDetail(deckId))

    return res
  }
)
