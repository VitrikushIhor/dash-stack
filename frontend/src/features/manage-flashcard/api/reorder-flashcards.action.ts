'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { ReorderFlashcardsPayloadSchema } from '@/entities/deck'
import { flashcardServerApi } from '@/entities/deck/server'

export const reorderFlashcardsAction = createAction(
  ReorderFlashcardsPayloadSchema,
  async ({ deckId, orderedCardIds }) => {
    await flashcardServerApi.reorder(deckId, orderedCardIds)
    revalidateTag(SERVER_CACHE_TAGS.deckDetail(deckId))
  }
)
