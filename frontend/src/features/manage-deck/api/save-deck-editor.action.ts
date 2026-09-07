'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import {
  DeckEditorSaveResponseSchema,
  SaveDeckEditorPayloadSchema,
} from '@/entities/deck'
import { deckServerApi } from '@/entities/deck/server'

export const saveDeckEditorAction = createAction(
  SaveDeckEditorPayloadSchema,
  async ({ id, data }) => {
    const savedDeck = await deckServerApi.saveEditor(id, data)
    const parsedResponse = DeckEditorSaveResponseSchema.safeParse(savedDeck)
    if (!parsedResponse.success) {
      throw new Error('Deck editor save returned an incomplete response')
    }
    revalidateTag(SERVER_CACHE_TAGS.decks)
    revalidateTag(SERVER_CACHE_TAGS.deckDetail(id))
    return savedDeck
  }
)
