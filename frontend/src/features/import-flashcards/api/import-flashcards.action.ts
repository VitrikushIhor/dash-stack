'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { ImportFlashcardsPayloadSchema } from '@/entities/vocab'
import { vocabServerApi } from '@/entities/vocab/server'

export const importFlashcardsAction = createAction(
  ImportFlashcardsPayloadSchema,
  async ({ deckId, importId, cards }) => {
    const response = await vocabServerApi.importFlashcards(deckId, {
      importId,
      cards,
    })
    revalidateTag(SERVER_CACHE_TAGS.deckDetail(deckId))
    revalidateTag(SERVER_CACHE_TAGS.studySession(deckId))
    return response
  }
)
