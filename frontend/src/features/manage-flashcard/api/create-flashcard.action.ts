'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { CreateFlashcardPayloadSchema } from '@/entities/deck'
import { flashcardServerApi } from '@/entities/deck/server'

export const createFlashcardAction = createAction(
  CreateFlashcardPayloadSchema,
  async ({ deckId, data }) => {
    const res = await flashcardServerApi.create(deckId, { cards: [data] })

    revalidateTag(SERVER_CACHE_TAGS.deckDetail(deckId))

    return res[0]
  }
)
