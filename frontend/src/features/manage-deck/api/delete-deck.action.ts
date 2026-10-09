'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { DeckIdPayloadSchema } from '@/entities/deck'
import { deckServerApi } from '@/entities/deck/server'

export const deleteDeckAction = createAction(
  DeckIdPayloadSchema,
  async ({ id }) => {
    await deckServerApi.delete(id)
    revalidateTag(SERVER_CACHE_TAGS.decks)
    revalidateTag(SERVER_CACHE_TAGS.deckDetail(id))

    return { id }
  }
)
