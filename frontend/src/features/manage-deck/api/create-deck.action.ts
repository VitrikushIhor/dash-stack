'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { CreateDeckSchema } from '@/entities/deck'
import { deckServerApi } from '@/entities/deck/server'

export const createDeckAction = createAction(CreateDeckSchema, async (data) => {
  const res = await deckServerApi.create(data)

  revalidateTag(SERVER_CACHE_TAGS.decks)

  return res
})
