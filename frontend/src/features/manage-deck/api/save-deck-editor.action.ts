'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { SaveDeckEditorPayloadSchema } from '@/entities/deck'
import { deckServerApi } from '@/entities/deck/server'

export const saveDeckEditorAction = createAction(
  SaveDeckEditorPayloadSchema,
  async ({ id, data }) => {
    const savedDeck = await deckServerApi.saveEditor(id, data)
    revalidateTag(SERVER_CACHE_TAGS.decks)
    revalidateTag(SERVER_CACHE_TAGS.deckDetail(id))
    return savedDeck
  }
)
