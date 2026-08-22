'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { BatchSaveFlashcardsPayloadSchema } from '@/entities/deck'
import { flashcardServerApi } from '@/entities/deck/server'

export const batchSaveFlashcardsAction = createAction(
  BatchSaveFlashcardsPayloadSchema,
  async ({ deckId, cards, deletedCardIds }) => {
    const newCards = []
    const existingCards = []

    for (const card of cards) {
      const { id, isNew, ...data } = card
      const cleanData = {
        term: data.term,
        definition: data.definition,
        example: data.example || undefined,
        imageUrl: data.imageUrl || undefined,
        position: data.position,
      }

      if (isNew || !id || id.startsWith('temp-')) {
        newCards.push(cleanData)
      } else {
        existingCards.push({ id, ...cleanData })
      }
    }

    const promises: Promise<unknown>[] = []

    // 1. Delete removed cards
    if (deletedCardIds && deletedCardIds.length > 0) {
      for (const cardId of deletedCardIds) {
        if (!cardId.startsWith('temp-')) {
          promises.push(flashcardServerApi.delete(deckId, cardId))
        }
      }
    }

    // 2. Create new cards
    if (newCards.length > 0) {
      promises.push(flashcardServerApi.create(deckId, { cards: newCards }))
    }

    // 3. Update existing cards
    if (existingCards.length > 0) {
      for (const card of existingCards) {
        const { id, ...data } = card
        promises.push(
          flashcardServerApi.update(deckId, id, {
            term: data.term,
            definition: data.definition,
            example: data.example,
            imageUrl: data.imageUrl,
            position: data.position,
          })
        )
      }
    }

    if (promises.length === 0) {
      return { success: true }
    }

    const results = await Promise.allSettled(promises)
    const rejected = results.filter((r) => r.status === 'rejected')

    revalidateTag(SERVER_CACHE_TAGS.deckDetail(deckId))

    if (rejected.length > 0) {
      const firstError = (rejected[0] as PromiseRejectedResult).reason
      const message =
        firstError instanceof Error
          ? firstError.message
          : `Failed to save flashcards: ${rejected.length} operations failed`
      throw new Error(message)
    }

    return { success: true }
  }
)
