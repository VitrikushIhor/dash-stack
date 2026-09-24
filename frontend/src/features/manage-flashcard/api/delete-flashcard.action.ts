'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { DeleteFlashcardPayloadSchema } from '@/entities/deck'
import { flashcardServerApi } from '@/entities/deck/server'

export const deleteFlashcardAction = createAction(
  DeleteFlashcardPayloadSchema,
  async ({ deckId, cardId }) => {
    await flashcardServerApi.delete(deckId, cardId)
    revalidateTag(SERVER_CACHE_TAGS.deckDetail(deckId))
  }
)
