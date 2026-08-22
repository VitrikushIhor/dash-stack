'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { UpdateDeckPayloadSchema } from '@/entities/deck'
import { deckServerApi } from '@/entities/deck/server'

export const updateDeckAction = createAction(
  UpdateDeckPayloadSchema,
  async ({ id, data }) => {
    const res = await deckServerApi.update(id, data)
    revalidateTag(SERVER_CACHE_TAGS.decks)
    revalidateTag(SERVER_CACHE_TAGS.deckDetail(id))
    return res
  }
)
